from google import genai
import re, json, ast

client = genai.Client()

def clean_llm_response(llm_response: str):
    llm_response = llm_response.strip()
    llm_response = re.sub(r"```[a-zA-Z]*", "", llm_response)
    llm_response = llm_response.replace("```", "")
    llm_response = llm_response.replace("\\n", " ").replace("\n", " ")
    llm_response = " ".join(llm_response.split())

    # Try to unescape any quoted content
    try:
        llm_response = ast.literal_eval(f'"{llm_response}"')
    except Exception:
        pass

    return llm_response



async def query_neo4j_with_llm(user_query: str):
  prompt = f"""
    You are an expert in Neo4j and Cypher.

    The database has nodes:
    - Project
    - Resource
    - Concept

    Relationships:
    - (Project)-[:HAS_RESOURCE]->(Resource)
    - (Resource)-[:COVERS]->(Concept)

    Your task:
    Given a natural language query, generate a Cypher query that returns all matching Resource nodes.
    - Use the alias `r` for Resource nodes and `c` for Concept nodes.
    - Include the related Concept nodes if they are relevant.
    - If the query mentions a Project, filter resources for that Project.
    - If the query mentions a Concept, filter resources linked to that Concept using case-insensitive partial matching with CONTAINS.
    - If the query is general, return all Resource nodes.

    Write **only the Cypher query**, using these aliases (`r` for Resource, `c` for Concept). Do not include explanations, comments, or markdown.
    Here is the user query:
    "{user_query}"
  """


  
  llm_response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt
  )

  cypher_text = ""
  if (
        llm_response.candidates
        and llm_response.candidates[0].content
        and llm_response.candidates[0].content.parts
    ):
        cypher_text = llm_response.candidates[0].content.parts[0].text.strip()

        # Remove markdown formatting if any
        cypher_text = cypher_text.replace("```cypher", "").replace("```", "").strip()

  return cypher_text