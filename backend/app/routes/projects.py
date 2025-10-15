from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import create_client
import os, jwt
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer
from typing import List
from app.workflows.google_doc_workflow import run_google_doc_workflow
from app.workflows.mail_workflow import run_mail_workflow

load_dotenv()
router = APIRouter()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

SECRET_KEY = os.environ.get("JWT_SECRET")
ALGORITHM = os.environ.get("JWT_ALGORITHM")

class ProjectRequest(BaseModel):
    name: str
    description: str | None = None
    sheet_id: str | None = None
    doc_id: str | None = None

class ProjectResponse(BaseModel):
    name: str
    description: str | None = None
    id: str

class WorkflowRequest(BaseModel):
    project_id: str
    prompt: str

class MailRequest(BaseModel):
    project_id: str
    prompt: str
    recipient: str

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {"id": payload["user_id"], "email": payload["email"]}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
@router.get("/", response_model=List[ProjectResponse])
async def get_projects(current_user: dict = Depends(get_current_user)):
    response = supabase.table("Projects").select("*").eq("created_by", current_user["id"]).execute()
    if response.data:
        return response.data
    else:
        return []


@router.post("/")
def add_project(project: ProjectRequest, current_user: dict = Depends(get_current_user)):
    project_data = project.dict()
    project_data["created_by"] = current_user["id"]

    response = supabase.table("Projects").insert(project_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail=response.error.message)

    return {"message": "Project added", "data": response.data}

@router.post("/write-to-docs")
async def run_workflow(request: WorkflowRequest):
    try:
        result = run_google_doc_workflow(project_id=request.project_id, prompt=request.prompt)
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/send-mail")
async def send_mail(request: MailRequest):
    try:
        result = run_mail_workflow(
            project_id=request.project_id,
            prompt=request.prompt,
            recipient=request.recipient
        )
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
