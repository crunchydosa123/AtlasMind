from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials
import re

class GoogleDocsService:
    def __init__(self, creds_json_path: str):
        self.creds = Credentials.from_service_account_file(creds_json_path)
        self.docs_service = build("docs", "v1", credentials=self.creds)

    def _extract_doc_id(self, url: str) -> str:
        """Extract Google Doc ID from full URL or return ID directly."""
        match = re.search(r"/d/([a-zA-Z0-9-_]+)", url)
        return match.group(1) if match else url

    def append_text(self, doc_url: str, text: str):
        """Append text at the end of a Google Doc."""
        doc_id = self._extract_doc_id(doc_url)

        # Get the current document to find the end index
        doc = self.docs_service.documents().get(documentId=doc_id).execute()
        end_index = doc.get("body", {}).get("content", [])[-1]["endIndex"]

        requests = [
            {"insertText": {"location": {"index": end_index - 1}, "text": text + "\n\n"}}
        ]
        self.docs_service.documents().batchUpdate(
            documentId=doc_id, body={"requests": requests}
        ).execute()
        return {"status": "success", "doc_id": doc_id, "text_length": len(text)}

