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



async def query_neo4j_with_llm(user_query: str, project_id: str, selected_resources: list[str]):
    """
    Generate a Cypher query using LLM while enforcing:
    - Project scoping
    - Resource scoping (selected resource IDs)
    """

    # Format resource_id list into Cypher list syntax
    resource_list_cypher = "[" + ",".join([f"'{rid}'" for rid in selected_resources]) + "]"

    prompt = f"""
    You are an expert in Neo4j and Cypher.

    Database structure:
    - (Project)-[:HAS_RESOURCE]->(Resource)
    - (Resource)-[:COVERS]->(Concept)

    Query rules:
    - Always scope to Project id = "{project_id}".
    - Always restrict Resource to Names in this list:
      {resource_list_cypher}

    - Use alias r for Resource, c for Concept.
    - If the user mentions a Concept → filter using:
      toLower(c.name) CONTAINS toLower(<concept>)

    - If the user asks "what is this resource about", "explain <name>", or includes a resource name → 
      filter using:
      toLower(r.name) CONTAINS toLower(<name>)

    - If query is general → return all selected resources and their concepts.

    Return ONLY the Cypher query, no explanation, no markdown.

    User query:
    "{user_query}"
    """

    llm_response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    # Extract LLM text safely
    cypher_text = (
        llm_response.candidates[0].content.parts[0].text.strip()
        if llm_response.candidates
        else ""
    )
    cypher_text = cypher_text.replace("```", "").replace("cypher", "").strip()

    # Force project + resource scoping if missing
    if "MATCH" not in cypher_text:
        # LLM failed → fallback generic query
        cypher_text = """
        MATCH (p:Project {id: '%s'})-[:HAS_RESOURCE]->(r:Resource)
        WHERE r.name IN %s
        OPTIONAL MATCH (r)-[:COVERS]->(c:Concept)
        RETURN r, c
        """ % (project_id, resource_list_cypher)
        return cypher_text.strip()

    # Ensure scoping exists
    if "Project" not in cypher_text:
        cypher_text = f"""
        MATCH (p:Project {{id: '{project_id}'}})-[:HAS_RESOURCE]->(r:Resource)
        WHERE r.name IN {resource_list_cypher}
        {cypher_text}
        """.strip()

    # Ensure resource restriction exists
    if "r.name IN" not in cypher_text:
        cypher_text = cypher_text.replace(
            "WHERE",
            f"WHERE r.name IN {resource_list_cypher} AND "
        )

    return cypher_text.strip()

async def generate_llm_response(user_query: str, context: dict):
    context_text = "\n\n".join(
        [f"{k}:\n{v}" for k, v in context.items()]
    )

    prompt = f"""
      You are an AI assistant helping a user explore project documents.
      You are given contextual excerpts from resources in a Neo4j database.
      Use them to answer the user's question truthfully.

      User query:
      {user_query}

      Context (from related resources):
      {context_text}

      Respond concisely, citing which resources you used.
      """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.candidates[0].content.parts[0].text