from fastapi import APIRouter  # Import APIRouter for creating API routes
from pydantic import BaseModel  # Import BaseModel for request validation
import os  # Import os for environment variable access
from openai import OpenAI  # Import OpenAI for interacting with the OpenAI API
from dotenv import load_dotenv  # Import load_dotenv for loading environment variables from a .env file
from datetime import datetime  # Import datetime for timestamping messages
from db import messages_collection  # Import messages_collection for database operations

load_dotenv()  # Load environment variables from .env file

# Initialize OpenAI client with API key from environment variable
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
chat_router = APIRouter()

# Request model
class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

# POST /chat - handles user prompts and stores responses
@chat_router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        user_input = request.message.lower()

        # Filter to allow only finance-related queries
        finance_keywords = [
            "tfsa", "rrsp", "credit", "debit", "interest", "bank", "rbc",
            "tax", "investment", "mortgage", "saving", "loan", "dividend",
            "stock", "budget", "financial", "chequing", "account", "capital", "income"
        ]

        if not any(keyword in user_input for keyword in finance_keywords):
            bot_reply = "This is a financial chatbot helper. Please keep your questions related to personal finance, banking, or investing."
        else:
            # Call OpenAI API
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": request.message}]
            )
            bot_reply = response.choices[0].message.content

        # Store user message
        user_msg = {
            "sender": "user",
            "content": request.message,
            "timestamp": datetime.utcnow(),
            "session_id": request.session_id,
        }
        messages_collection.insert_one(user_msg)

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
        print("Error:", str(e))
        return {"error": str(e)}

# DELETE /chat - clears all chat messages
@chat_router.delete("/chat")
async def clear_chat():
    messages_collection.delete_many({})
    return {"status": "cleared"}