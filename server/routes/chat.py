from fastapi import APIRouter
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI client with API key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Create a router instance
chat_router = APIRouter()

# Define the expected request body schema
class ChatRequest(BaseModel):
    message: str

# POST route to handle chatbot interactions
@chat_router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # Make a request to the OpenAI API with the user's message
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": request.message}
            ]
        )

        # Log the full response for debugging
        print("OpenAI response:", response)

        # Return only the assistant's message content
        return {"response": response.choices[0].message.content}

    except Exception as e:
        print("Error:", str(e))
        return {"error": str(e)}
