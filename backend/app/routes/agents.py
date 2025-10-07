from fastapi import APIRouter
from pydantic import BaseModel
from app.services.agent_service import call_phi3mini
import uuid
from uuid import UUID

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: UUID

# List and add agents (static example)
@router.get("/")
def list_agents():
    return {"agents": ["agent1", "agent2"]}

@router.post("/")
def add_agent(agent: dict):
    return {"message": "Agent added", "data": agent}

# Chat endpoint using phi3:mini
@router.post("/chat")
async def chat_with_agent(request: ChatRequest):
    response = call_phi3mini(request.session_id, request.message)
    return {"session_id": request.session_id, "response": response}

