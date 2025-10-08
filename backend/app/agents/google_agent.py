from app.agents.base_agent import BaseAgent
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials
from google import genai
import os
import re

class GoogleAgent(BaseAgent):
    def __init__(self, creds_json_path: str, gemini_api_key: str = None):
        self.creds = Credentials.from_service_account_file(creds_json_path)
        self.docs_service = build("docs", "v1", credentials=self.creds)
        self.sheets_service = build("sheets", "v4", credentials=self.creds)

        api_key = gemini_api_key or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set")
        self.genai_client = genai.Client(api_key=api_key)

    def _extract_id(self, url: str) -> str:
        """Extract Google Doc/Sheet ID from a full URL or return the ID if already given."""
        if not url:
            return None
        match = re.search(r"/d/([a-zA-Z0-9-_]+)", url)
        return match.group(1) if match else url

    def run(self, project_id: str, context: dict, prompt: str):
        full_prompt = f"Project info: {context}\n\nTask: {prompt}"

        response = self.genai_client.models.generate_content(
            model="gemini-2.5-flash", contents=full_prompt
        )
        print(response.candidates[0].content.parts[0].text)
        llm_output = response.candidates[0].content.parts[0].text


        doc_id = context.get("doc_id")
        if doc_id:
            doc_id = self._extract_id(doc_id)
            print("Extracted Google Doc ID:", doc_id)
            requests = [{"insertText": {"location": {"index": 1}, "text": llm_output}}]
            self.docs_service.documents().batchUpdate(
                documentId=doc_id, body={"requests": requests}
            ).execute()

        sheet_id = context.get("sheet_id")
        if sheet_id:
            self.sheets_service.spreadsheets().values().append(
                spreadsheetId=sheet_id,
                range="Sheet1",
                valueInputOption="RAW",
                body={"values": [[llm_output]]},
            ).execute()

        return {"status": "success", "output": llm_output}
