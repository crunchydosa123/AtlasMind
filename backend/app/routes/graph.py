from fastapi import APIRouter, HTTPException, Request, Query
from pydantic import BaseModel
from supabase import create_client
import os, jwt
from dotenv import load_dotenv
from datetime import datetime, timedelta
from passlib.hash import sha256_crypt
from app.services.neo4j_service import get_project_graph

router = APIRouter()

@router.get('')
def get_graph(project_id: str = Query(...)):
  return get_project_graph(project_id)