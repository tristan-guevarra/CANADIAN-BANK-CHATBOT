from fastapi import APIRouter
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

chat_router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@chat_router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": request.message}]
        )
        print("OpenAI response:", response)
        return {"response": response.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}

