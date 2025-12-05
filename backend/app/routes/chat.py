from fastapi import APIRouter, HTTPException, Request, Query
from pydantic import BaseModel
from app.services.llm_service import query_neo4j_with_llm, clean_llm_response, generate_llm_response
from app.services.projects_service import get_resource_text
from app.services.neo4j_service import run_cypher_query
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

# Define request body schema
class LLMQuery(BaseModel):
    query: str
    selected_resources: list[str] | None = None

@router.post("/cipher")
async def get_cipher_query(req: LLMQuery, project_id:str = Query(...)):
    """
    Send a natural language query to the LLM to generate a Neo4j Cypher query.
    """
    try:
        # Pass the user query to the LLM service
        result = await query_neo4j_with_llm(req.query, project_id=project_id)
        print(result)

        query = clean_llm_response(result)
        print(query)

        db_result = run_cypher_query(query)

        context = {}

        for record in db_result.get("results", []):
          print("record: ", record)
          resource = record.get("r")
          if resource:
              resource_id = resource["id"]
              # Assume get_parsed_text is imported and returns text
              context[resource_id] = get_resource_text(resource_id)

        print(context)
        
        print(query)
        return {
            "cypher_query": query,
            "db_result": db_result,
            "context": context
            }
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post('/llm')
async def chat_with_context(req: LLMQuery, project_id: str = Query(...)):
    """
    Full flow:
    1. Convert user query → Cypher query (via LLM)
    2. Execute Cypher on Neo4j
    3. For each Resource node, fetch parsed text as context
    4. Pass {user query + context} → LLM for reasoning
    5. Return Cypher, db_result, context, and final LLM response
    """
    try:
        # Step 1: Generate Cypher query using LLM
        llm_result = await query_neo4j_with_llm(req.query, project_id, req.selected_resources)
        cypher_query = clean_llm_response(llm_result)
        print(f"🧠 Generated Cypher: {cypher_query}")

        # Step 2: Run the Cypher query
        db_result = run_cypher_query(cypher_query)
        resources = db_result.get("results", [])

        if not resources:
            return {
                "message": "No relevant data found.",
                "cypher_query": cypher_query
            }

        # Step 3: Gather context from all retrieved resources
        context = {}
        for record in resources:
            r = record.get("r") or record.get("resource")
            if not r:
                continue

            resource_id = r.get("id")
            resource_name = r.get("name")
            if not resource_id or not resource_name:
                continue

            # Fetch pre-parsed text for that resource
            parsed_text = get_resource_text(resource_id)
            context[resource_name] = parsed_text

        # Step 4: Generate the LLM’s reasoning response
        llm_response = await generate_llm_response(req.query, {
            "cypher_query": cypher_query,
            "db_result": db_result,
            "context": context
        })

        # Step 5: Return complete structured response
        return {
            "cypher_query": cypher_query,
            "db_result": db_result,
            "context": context,
            "llm_response": llm_response
        }

    except Exception as e:
        print(f"❌ Error in /llm route: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
