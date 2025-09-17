import redis
import json

# connect to Redis
r = redis.Redis(host="localhost", port=6379, decode_responses=True)

def save_message(session_id: str, role: str, content: str):
    """Store a message in Redis as a JSON object"""
    message = {"role": role, "content": content}
    r.rpush(f"chat:{session_id}", json.dumps(message))

def get_conversation(session_id: str):
    """Fetch entire conversation history"""
    messages = r.lrange(f"chat:{session_id}", 0, -1)
    return [json.loads(m) for m in messages]
