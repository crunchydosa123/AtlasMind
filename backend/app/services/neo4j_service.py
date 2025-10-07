from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()

NEO4J_URI = os.environ.get("NEO4J_URI") 
NEO4J_USER = os.environ.get("NEO4J_USERNAME")
NEO4J_PASSWORD = os.environ.get("NEO4J_PASSWORD")
AUTH = (NEO4J_USER, NEO4J_PASSWORD)

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def create_project(tx, project_id, project_name):
    tx.run(
        "MERGE (p:Project {id: $id}) "
        "SET p.name = $name",
        id=str(project_id),
        name=project_name
    )

def create_resource(tx, resource_id, resource_name, project_id):
    tx.run(
        "MERGE (r:Resource {id: $id}) "
        "SET r.name = $name "
        "WITH r "
        "MATCH (p:Project {id: $project_id}) "
        "MERGE (p)-[:HAS_RESOURCE]->(r)",
        id=str(resource_id),
        name=resource_name,
        project_id=str(project_id)
    )

def add_resource_to_graph(resource_id, resource_name, project_id):
    with driver.session() as session:
        session.execute_write(create_resource, resource_id, resource_name, project_id)

def close_driver():
    driver.close()
