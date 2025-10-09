import os
from langgraph.graph import StateGraph, END
from typing import TypedDict
from app.agents.google_agent import GoogleAgent
from app.services.projects_service import get_project_context

creds_path_var = os.environ.get("GOOGLE_CREDS_JSON")
if not creds_path_var:
    raise ValueError("GOOGLE_CREDS_JSON environment variable not set")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
creds_path = os.path.join(BASE_DIR, creds_path_var)

google_agent = GoogleAgent(creds_json_path=creds_path)

class WorkflowState(TypedDict):
    project_id: str
    prompt: str
    context: dict
    agent_result: dict

def fetch_context_node(state: WorkflowState) -> WorkflowState:
    """Fetch project context"""
    context = get_project_context(state["project_id"])
    if not context:
        raise ValueError(f"No project found with id {state['project_id']}")
    return {"context": context}

def run_agent_node(state: WorkflowState) -> WorkflowState:
    """Run the Google agent with context and prompt"""
    result = google_agent.run(
        project_id=state["project_id"],
        context=state["context"],
        prompt=state["prompt"]
    )
    return {"agent_result": result}

workflow = StateGraph(WorkflowState)

workflow.add_node("fetch_context", fetch_context_node)
workflow.add_node("run_google_agent", run_agent_node)

workflow.add_edge("fetch_context", "run_google_agent")
workflow.add_edge("run_google_agent", END)

workflow.set_entry_point("fetch_context")

app = workflow.compile()

def run_google_doc_workflow(project_id: str, prompt: str):
    """Execute the workflow"""
    return app.invoke({
        "project_id": project_id,
        "prompt": prompt
    })