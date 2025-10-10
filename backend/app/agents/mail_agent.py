# app/agents/mail_agent.py
from app.agents.base_agent import BaseAgent
from google import genai
import smtplib
from email.mime.text import MIMEText
import os

class MailAgent(BaseAgent):
    def __init__(self, smtp_host: str, smtp_port: int, email: str, password: str, gemini_api_key: str = None):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.email = email
        self.password = password

        api_key = gemini_api_key or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set")
        self.genai_client = genai.Client(api_key=api_key)

    def run(self, project_id: str, context: dict, prompt: str, recipient: str):
        full_prompt = f"Project info: {context}\n\nTask: {prompt}"

        response = self.genai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_prompt
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
        message["from"] = self.email
        message["subject"] = subject

        with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port) as server:
            server.login(self.email, self.password)
            server.send_message(message)

        return {"status": "success", "subject": subject, "body": body}
