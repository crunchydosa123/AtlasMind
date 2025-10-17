from neo4j import GraphDatabase
import os
from dotenv import load_dotenv
import spacy

nlp = spacy.load("en_core_web_sm")

load_dotenv()

NEO4J_URI = os.environ.get("NEO4J_URI") 
NEO4J_USER = os.environ.get("NEO4J_USERNAME")
NEO4J_PASSWORD = os.environ.get("NEO4J_PASSWORD")
AUTH = (NEO4J_USER, NEO4J_PASSWORD)

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def extract_concepts(text, limit=5):
    doc = nlp(text)
    concepts = set()

    # Extract named entities
    for ent in doc.ents:
        concepts.add(ent.text)

    # Extract noun chunks
    for chunk in doc.noun_chunks:
        concepts.add(chunk.text)

    # Convert to list and take only the first `limit` concepts
    return list(concepts)[:limit]

def link_resource_to_concept(tx, resource_id, concept_name):
    tx.run("""
        MATCH (r:Resource {id: $resource_id})
        MERGE (c:Concept {name: $concept_name})
          ON CREATE SET c.id = randomUUID()
        MERGE (r)-[:COVERS]->(c)
        """,
        resource_id=resource_id,
        concept_name=concept_name,
    )

def create_project(tx, project_id, project_name):
    tx.run(
        "MERGE (p:Project {id: $id}) "
        "SET p.name = $name",
        id=str(project_id),
        name=project_name
    )

def create_resource(tx, resource_id, resource_name, project_id, uploaded_by=None):
    """
    Create a Resource node, link it to the Project, and optionally to the User who uploaded it.
    """
    # Basic resource → project
    query = """
    MERGE (r:Resource {id: $id})
      SET r.name = $name
    WITH r
    MATCH (p:Project {id: $project_id})
    MERGE (p)-[:HAS_RESOURCE]->(r)
    """
    
    # Optional: link to user
    if uploaded_by:
        query += """
        WITH r, p
        MATCH (u:User {id: $uploaded_by})
        MERGE (r)-[:UPLOADED_BY]->(u)
        """
    
    tx.run(query, id=str(resource_id), name=resource_name,
           project_id=str(project_id), uploaded_by=uploaded_by)
    

def add_resource_with_concepts(resource_id, resource_name, project_id, concepts, uploaded_by=None):
    """
    Service function: adds resource node and links concepts
    """
    with driver.session() as session:
        # Add the resource node
        session.execute_write(create_resource, resource_id, resource_name, project_id, uploaded_by)
        
        # Link concepts
        for concept in concepts:
            session.execute_write(link_resource_to_concept, resource_id, concept)


def add_resource_to_graph(resource_id, resource_name, project_id, uploaded_by=None):
    with driver.session() as session:
        session.execute_write(create_resource, resource_id, resource_name, project_id, uploaded_by)

def add_project_to_graph(project_id, project_name):
    with driver.session() as session:
        session.execute_write(create_project, project_id, project_name)

def close_driver():
    driver.close() #only once after app closeS
