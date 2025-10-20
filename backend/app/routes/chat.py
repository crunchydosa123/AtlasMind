from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from app.services.llm_service import query_neo4j_with_llm, clean_llm_response
from app.services.projects_service import get_resource_text
from app.services.neo4j_service import run_cypher_query
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

# Define request body schema
class LLMQuery(BaseModel):
    query: str

@router.post("/cipher")
async def get_cipher_query(req: LLMQuery):
    """
    Send a natural language query to the LLM to generate a Neo4j Cypher query.
    """
    try:
        # Pass the user query to the LLM service
        result = await query_neo4j_with_llm(req.query)
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
