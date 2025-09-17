import requests
import json
from .redis_service import get_conversation, save_message

def call_phi3mini(session_id: str, prompt: str, max_tokens: int = 300):
    # retrieve past conversation
    history = get_conversation(session_id)

    # flatten conversation into a single text block
    context = ""
    for msg in history:
        context += f"{msg['role']}: {msg['content']}\n"
    
    # add new user message
    context += f"user: {prompt}\nassistant:"

    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "phi3:mini",
        "prompt": context,
        "max_tokens": max_tokens
    }

    response = requests.post(url, json=payload)
    text_output = []

    for line in response.text.strip().split("\n"):
        if not line:
            continue
        try:
            data = json.loads(line)
            if "response" in data:
                text_output.append(data["response"])
        except json.JSONDecodeError:
            continue

    final_response = "".join(text_output)

    # save new turn in Redis
    save_message(session_id, "user", prompt)
    save_message(session_id, "assistant", final_response)

    return final_response

