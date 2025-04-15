from fastapi import APIRouter
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime
from db import messages_collection

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
chat_router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"  # fallback to "default" if not provided

@chat_router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # Store user message
        user_msg = {
            "sender": "user",
            "content": request.message,
            "timestamp": datetime.utcnow(),
            "session_id": request.session_id,
        }
        messages_collection.insert_one(user_msg)

        # OpenAI response
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": request.message}]
        )
        bot_reply = response.choices[0].message.content

        # Store bot reply
        bot_msg = {
            "sender": "bot",
            "content": bot_reply,
            "timestamp": datetime.utcnow(),
            "session_id": request.session_id,
        }
        messages_collection.insert_one(bot_msg)

        return {"response": bot_reply}
    except Exception as e:
        print("❌ Error:", str(e))
        return {"error": str(e)}

@chat_router.delete("/chat")
async def clear_chat():
    messages_collection.delete_many({})
    return {"status": "cleared"}
