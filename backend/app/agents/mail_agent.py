from app.agents.base_agent import BaseAgent
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from google import genai
from email.mime.text import MIMEText
import base64
import os

class MailAgent(BaseAgent):
  def __init__(self, creds_json_path: str, gemini_api_key: str = None):
    self.creds = Credentials.from_service_account_file(creds_json_path, scopes=[
            "https://www.googleapis.com/auth/gmail.send"
        ])
    self.gmail_service = build("gmail", "v1", credentials=self.creds)

    api_key = gemini_api_key or os.environ.get("GEMINI_API_KEY")
    if not api_key:
      raise ValueError("GEMINI_API_KEY is not set")
    self.genai_client = genai.Client(api_key=api_key)

  def run(self, project_id: str, context: dict, prompt: str, recipient: str):
    full_prompt = f"Project info: {context}\n\nTask: {prompt}"

    response = self.genai_client.models.generate_content(
      model = "gemini-2.5-flash",
      contents = full_prompt
    )

    text = response.candidates[0].content.parts[0].text

    if "Subject" in text:
      parts = text.split("Subject:", 1)[1].strip().split("\n", 1)
      subject = parts[0].strip()
      body = parts[1].strip() if len(parts) > 1 else ""
    else:
      subject = "Generated Email"
      body = text

    message = MIMEText(body)
    message["to"] = recipient
    message["from"] = "me"
    message["subject"] = subject

    raw_message =  base64.urlsafe_b64encode(message.as_bytes()).decode()

    self.gmail_service.users().messages().send(
      userId="me", body={"raw": raw_message}
    ).execute()

    return {
      "status": "success",
      "subject": subject,
      "body": body
    }
