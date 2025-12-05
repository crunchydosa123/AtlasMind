from fastapi import APIRouter, HTTPException, Depends, status, Query
from pydantic import BaseModel
from app.services.agent_service import call_phi3mini
from typing import List, Optional
import uuid
import requests
from supabase import create_client
import httpx
from uuid import UUID
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer
import jwt
from google import genai
import os

load_dotenv()
router = APIRouter()

client = genai.Client()


class ChatRequest(BaseModel):
    message: str
    session_id: UUID

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
GOOGLE_CLIENT_SECRET=os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET")
SECRET_KEY = os.environ.get("JWT_SECRET")
ALGORITHM = os.environ.get("JWT_ALGORITHM")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def extract_doc_id(doc_url: str):
    """Extract the Google Doc ID from URL"""
    import re
    match = re.search(r"/d/([a-zA-Z0-9-_]+)", doc_url)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid Google Doc URL")
    return match.group(1)


async def refresh_google_token(refresh_token: str):
    print("client_id: ", GOOGLE_CLIENT_ID)
    url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, data=data)

    if resp.status_code != 200:
        raise HTTPException(
        status_code=500,
        detail=f"Failed to refresh Google access token: {resp.text}"
    )
    return resp.json()["access_token"]

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

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {"id": payload["user_id"], "email": payload["email"]}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

class CreateWorkflowRequest(BaseModel):
    input: str
    llm: str
    output: Optional[str] = None
    action: Optional[str] = None

class WorkflowResponse(BaseModel):
    workflow_id: str
    input: str
    llm: str
    output: Optional[str]
    created_at: str
    created_by: str     
    action: str

@router.post("/create-workflow", response_model=WorkflowResponse)
async def create_workflow(req: CreateWorkflowRequest, current_user: dict = Depends(get_current_user)):
    try:
        # Insert workflow
        workflow_res = (
            supabase.table("Workflows")
            .insert({
                "input_resource_id": req.input,
                "prompt": req.llm,
                "output_resource_id": req.output,
                "action": req.action,
                "created_by": current_user["id"],
            })
            .execute()
        )

        if not workflow_res.data or len(workflow_res.data) == 0:
            raise Exception("Failed to create workflow")

        workflow = workflow_res.data[0]
        print(workflow)
        return WorkflowResponse(
            workflow_id=str(workflow["id"]), 
            input=workflow["input_resource_id"],
            llm=workflow["prompt"],
            output=workflow.get("output_resource_id"),
            action=workflow["action"],  
            created_at=workflow["created_at"],
            created_by=workflow["created_by"],
        )


    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating workflow: {str(e)}"
        )
    
class WorkflowItem(BaseModel):
    workflow_id: str
    input: str
    llm: str
    output: Optional[str] = None
    action: str
    created_at: str
    created_by: str


@router.get("/workflows/list", response_model=List[WorkflowItem])
async def list_workflows(current_user: dict = Depends(get_current_user)):
    try:
        workflows_res = (
            supabase
            .table("Workflows")
            .select("*")
            .eq("created_by", current_user["id"])
            .order("created_at", desc=True)
            .execute()
        )
        
        if workflows_res.data is None:
            return []

        workflows = workflows_res.data
        print(workflows)
        return [
            WorkflowItem(
                workflow_id=str(w["new_id"]),
                input=w["input_resource_id"],
                llm=w["prompt"],
                output=w["output_resource_id"],
                action=w["action"],
                created_at=w["created_at"],
                created_by=w["created_by"],
            )
            for w in workflows
        ]

    except Exception as e:
        print("Error fetching workflows:", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error fetching workflows: {str(e)}"
        )
    
class RunWorkflowResponse(BaseModel):
    workflow_id: str
    input: str
    llm: str
    output: Optional[str] = None
    action: Optional[str] = None
    result: str

@router.get("/workflows/run", response_model=RunWorkflowResponse)
async def run_workflow(
    workflow_id: str = Query(..., description="ID of the workflow to run"),
    user: dict = Depends(get_current_user)
):
    try:
        # 1. Fetch workflow
        workflow_res = (
            supabase.table("Workflows")
            .select("*")
            .eq("new_id", workflow_id)
            .eq("created_by", user["id"])
            .single()
            .execute()
        )
        workflow = workflow_res.data
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        print(workflow)
        input_res_id = workflow["input_resource_id"]
        output_res_id = workflow["output_resource_id"]
        action = workflow.get("action")
        prompt = workflow["prompt"]

        # 2. Fetch input/output resources
        input_res = supabase.table("Resources").select("*").eq("id", input_res_id).maybe_single().execute()
        output_res = supabase.table("Resources").select("*").eq("id", output_res_id).maybe_single().execute()

        print(input_res)
        if not input_res.data or not output_res.data:
            raise HTTPException(status_code=404, detail="Resource not found")

        input_doc_id = input_res.data.get("doc_id")
        output_doc_id = output_res.data.get("doc_id")

        if not input_doc_id or not output_doc_id:
            raise HTTPException(status_code=400, detail="Resource doc_id missing")

        # 3. Get user access token
        user_res = supabase.table("Users").select("*").eq("id", user["id"]).maybe_single().execute()
        access_token = user_res.data.get("access_token")
        refresh_token = user_res.data.get("refresh_token")

        if not access_token:
            raise HTTPException(status_code=401, detail="Google access token not found")
        headers = {"Authorization": f"Bearer {access_token}"}

        # 4. Fetch input document content
        input_doc_resp = requests.get(f"https://docs.googleapis.com/v1/documents/{input_doc_id}", headers=headers)
        if input_doc_resp.status_code == 401:
            # refresh token
            access_token = refresh_google_token(refresh_token)
            supabase.table("Users").update({"access_token": access_token}).eq("id", user["id"]).execute()
            headers["Authorization"] = f"Bearer {access_token}"
            input_doc_resp = requests.get(f"https://docs.googleapis.com/v1/documents/{input_doc_id}", headers=headers)

        input_doc = input_doc_resp.json()
        text_content = input_doc.get("body", {}).get("content", [])
        input_text = " ".join([
            c.get("paragraph", {}).get("elements", [{}])[0].get("textRun", {}).get("content", "")
            for c in text_content
        ])

        # 5. Call AI on input text
        llm_response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"{prompt}\n\n{input_text}"  # combine prompt + input text
        )

        llm_response_parsed = llm_response.candidates[0].content.parts[0].text

        # 6. Update output document
        requests_body = [{"insertText": {"location": {"index": 1}, "text": llm_response_parsed}}]
        batch_resp = requests.post(
            f"https://docs.googleapis.com/v1/documents/{output_doc_id}:batchUpdate",
            headers={**headers, "Content-Type": "application/json"},
            json={"requests": requests_body},
        )
        if batch_resp.status_code >= 400:
            raise HTTPException(status_code=500, detail="Failed to update output document")

        return RunWorkflowResponse(
            workflow_id=str(workflow["id"]),
            input=input_res_id,
            llm=prompt,
            output=output_res_id,
            action=action,
            result=llm_response_parsed
        )

    except Exception as e:
        print("Error running workflow:", e)
        raise HTTPException(status_code=400, detail=str(e))
