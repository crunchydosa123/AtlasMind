from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import create_client
import os, jwt
import requests
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer
from typing import List
from app.workflows.google_doc_workflow import run_google_doc_workflow
from app.workflows.mail_workflow import run_mail_workflow
from app.services.neo4j_service import add_project_to_graph
from app.services.google_docs_service import GoogleDocsService

load_dotenv()
router = APIRouter()

creds_path_var = os.environ.get("GOOGLE_CREDS_JSON")
if not creds_path_var:
    raise ValueError("GOOGLE_CREDS_JSON environment variable not set")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
creds_path = os.path.join(BASE_DIR, creds_path_var)

google_docs_service = GoogleDocsService(creds_path)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
GOOGLE_CLIENT_SECRET=os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET")
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
    doc_id: str | None = None
    sheet_id: str | None = None

class WorkflowRequest(BaseModel):
    project_id: str
    prompt: str

class MailRequest(BaseModel):
    project_id: str
    prompt: str
    recipient: str

class PushRequest(BaseModel):
    text: str
    doc_url: str | None = None

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
    project_id = response.data[0]["id"]
    project_name = response.data[0]["name"]
    add_project_to_graph(project_id, project_name)
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
    
def refresh_google_token(refresh_token: str):
    """Refresh expired Google OAuth token"""
    resp = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        },
    )
    if resp.status_code != 200:
        raise Exception(f"Failed to refresh token: {resp.text}")
    return resp.json()["access_token"]

def extract_doc_id(doc_url: str):
    """Extract the Google Doc ID from URL"""
    import re
    match = re.search(r"/d/([a-zA-Z0-9-_]+)", doc_url)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid Google Doc URL")
    return match.group(1)

@router.post("/push-to-docs")
async def push_to_docs(req: PushRequest, user: dict = Depends(get_current_user)):
    print("Received request:", req.dict())
    doc_id = extract_doc_id(req.doc_url)
    print("Extracted doc_id:", doc_id)
    # 1. Get user tokens from Supabase
    print(user)
    user_res = (
        supabase.table("Users")
        .select("*")
        .eq("id", user["id"])
        .maybe_single()
        .execute()
    )

    if not user_res or not user_res.data:
        print('user not found')
        raise HTTPException(status_code=400, detail="User not found")

    google_user = user_res.data
    access_token = google_user["access_token"]
    refresh_token = google_user["refresh_token"]

    doc_id = extract_doc_id(req.doc_url)
    headers = {"Authorization": f"Bearer {access_token}"}

    # 2. Try fetching the doc (to check token validity)
    doc_resp = requests.get(f"https://docs.googleapis.com/v1/documents/{doc_id}", headers=headers)
    print(doc_resp)
    if doc_resp.status_code == 401:
        # Token expired, refresh it
        access_token = refresh_google_token(refresh_token)
        # Update Supabase with new access token
        supabase.table("Users").update({"access_token": access_token}).eq("id", user["id"]).execute()
        headers = {"Authorization": f"Bearer {access_token}"}
        doc_resp = requests.get(f"https://docs.googleapis.com/v1/documents/{doc_id}", headers=headers)

    if doc_resp.status_code != 200:
        print(doc_resp)
        raise HTTPException(status_code=doc_resp.status_code, detail=doc_resp.text)

    # 3. Append text to the doc
    doc = doc_resp.json()
    end_index = doc.get("body", {}).get("content", [])[-1]["endIndex"]
    requests_body = [{"insertText": {"location": {"index": end_index - 1}, "text": req.text + "\n\n"}}]

    batch_resp = requests.post(
        f"https://docs.googleapis.com/v1/documents/{doc_id}:batchUpdate",
        headers={**headers, "Content-Type": "application/json"},
        json={"requests": requests_body},
    )
    

    if batch_resp.status_code != 200:
        print(batch_resp)
        raise HTTPException(status_code=batch_resp.status_code, detail=batch_resp.text)

    return {"status": "success", "doc_id": doc_id, "text_length": len(req.text)}

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
