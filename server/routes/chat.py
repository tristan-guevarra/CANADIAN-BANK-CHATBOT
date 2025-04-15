from fastapi import APIRouter
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime
from db import messages_collection  # <-- Import from db.py

# Load environment variables
load_dotenv()

# Initialize OpenAI client with API key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# Initialize FastAPI router
chat_router = APIRouter()

# Define the request model for the chat endpoint
class ChatRequest(BaseModel):
    message: str

# POST route to handle chatbot interactions
@chat_router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # Store user message in DB
        user_msg = {
            "sender": "user",
            "content": request.message,
            "timestamp": datetime.utcnow()
        }
        messages_collection.insert_one(user_msg)

        # Get OpenAI response
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": request.message}]
        )
        bot_reply = response.choices[0].message.content

        # Store bot message in DB
        bot_msg = {
            "sender": "bot",
            "content": bot_reply,
            "timestamp": datetime.utcnow()
        }
        messages_collection.insert_one(bot_msg)

        return {"response": bot_reply}

    except Exception as e:
        print("Error:", str(e))
        return {"error": str(e)}
