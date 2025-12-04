from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, field_validator
from supabase import create_client
import os, jwt
from dotenv import load_dotenv
import requests
from fastapi.security import OAuth2PasswordBearer
import requests as http

load_dotenv()
router = APIRouter()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
GOOGLE_CLIENT_SECRET=os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET")
SECRET_KEY = os.environ.get("JWT_SECRET")
ALGORITHM = os.environ.get("JWT_ALGORITHM")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {"id": payload["user_id"], "email": payload["email"]}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
@router.get("/docs")
def list_google_docs(user=Depends(get_current_user)):
    user_res=(
      supabase.table("Users")
      .select("*")
      .eq("id", user["id"])
      .maybe_single()
      .execute()
    )
    #print(user)
    if not user_res or not user_res.data:
        print("google account not found")
        raise HTTPException(status_code=400, detail="Google account not found")
    
    google_user = user_res.data
    access_token = google_user["access_token"]
    refresh_token = google_user["refresh_token"]

    #print("access_token", access_token)
    #print("refresh_token", refresh_token)
    headers = {"Authorization": f"Bearer {access_token}"}

    drive_url = (
        "https://www.googleapis.com/drive/v3/files"
        "?q=mimeType='application/vnd.google-apps.document'"
        "&fields=files(id,name,modifiedTime,owners)"
    )
    docs_res = requests.get(drive_url, headers=headers)
    #print(docs_res.json())

    if docs_res.status_code == 401:  # invalid token
        refresh_res = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            },
        ).json()

        new_access_token = refresh_res.get("access_token")
        if not new_access_token:
            print("failed to get refresh token")
            raise HTTPException(status_code=400, detail="Failed to refresh token")
        
        supabase.table("Users").update({
            "access_token": new_access_token
        }).eq("google_id", google_user["google_id"]).execute()

        headers["Authorization"] = f"Bearer {new_access_token}"
        docs_res = requests.get(drive_url, headers=headers)

    if docs_res.status_code != 200:
        print("failed to fetch google docs")
        print(docs_res.json())
        raise HTTPException(status_code=400, detail="Failed to fetch Google Docs")

    return {"documents": docs_res.json()}



