# app/workflows/mail_workflow.py
import os
from langgraph.graph import StateGraph, END
from typing import TypedDict
from app.agents.mail_agent import MailAgent
from app.services.projects_service import get_project_context

# SMTP credentials (ProtonMail via Bridge or any SMTP server)
SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 465))
SMTP_EMAIL = os.environ.get("SMTP_EMAIL")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")

mail_agent = MailAgent(
    smtp_host=SMTP_HOST,
    smtp_port=SMTP_PORT,
    email=SMTP_EMAIL,
    password=SMTP_PASSWORD
)

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

def run_mail_agent_node(state: WorkflowState) -> WorkflowState:
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
