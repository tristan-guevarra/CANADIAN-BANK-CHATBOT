from fastapi import APIRouter # Import APIRouter for creating API routes
from pydantic import BaseModel # Import BaseModel for request validation
import os # Import os for environment variable access
from openai import OpenAI # Import OpenAI for interacting with the OpenAI API
from dotenv import load_dotenv # Import load_dotenv for loading environment variables from a .env file
from datetime import datetime # Import datetime for timestamping messages
from db import messages_collection # Import messages_collection for database operations

load_dotenv() # Load environment variables from .env file
# Initialize OpenAI client with API key from environment variable
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
chat_router = APIRouter()

class ChatRequest(BaseModel): # Define request model for chat endpoint
    message: str # Message content from the user
    session_id: str = "default"  # fallback to "default" if not provided

@chat_router.post("/chat") # Define a POST route for chat messages
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

@chat_router.delete("/chat") # Define a DELETE route to clear chat history
async def clear_chat(): # Clear chat history from the database
    messages_collection.delete_many({}) # Delete all messages from the collection
    return {"status": "cleared"} # Return success status
