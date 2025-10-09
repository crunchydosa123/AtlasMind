import os
from langgraph.graph import StateGraph, END
from typing import TypedDict
from app.agents.mail_agent import MailAgent
from app.services.projects_service import get_project_context

creds_path_var = os.environ.get("GOOGLE_CREDS_JSON")
if not creds_path_var:
  raise ValueError("GOOGLE_CREDS_JSON environment variable not set")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
creds_path = os.path.join(BASE_DIR, creds_path_var)

mail_agent = MailAgent(creds_json_path=creds_path)

class WorkflowState(TypedDict, total=False):
    project_id: str
    prompt: str
    recipient: str
    context: dict
    agent_result: dict

def fetch_context_node(state: WorkflowState) -> WorkflowState:
  context = get_project_context(state["project_id"])
  if not context:
    raise ValueError(f"No project found with id {state['project_id']}")
  state["context"] = context
  return state

def run_mail_agent_node(state):
    result = mail_agent.run(
        project_id=state["project_id"],
        context=state["context"],
        prompt=state["prompt"],
        recipient=state["recipient"]
    )
    state["agent_result"] = result
    return state

workflow = StateGraph(WorkflowState)
workflow.add_node("fetch_context", fetch_context_node)
workflow.add_node("run_agent", run_mail_agent_node)
workflow.add_edge("fetch_context", "run_agent")
workflow.add_edge("run_agent", END)
workflow.set_entry_point("fetch_context")
app = workflow.compile()

def run_mail_workflow(project_id: str, prompt: str, recipient: str):
  return app.invoke({"project_id": project_id, "prompt": prompt, "recipient": recipient})