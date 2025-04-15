from fastapi import APIRouter
from db import messages_collection
from pymongo import DESCENDING # Import DESCENDING for sorting

history_router = APIRouter() # Initialize FastAPI router

@history_router.get("/history") # Define a GET route to fetch chat history
async def get_chat_history(): # Fetch chat history from the database
    messages = list(messages_collection.find().sort("timestamp", DESCENDING).limit(50)) # Fetch the last 50 messages sorted by timestamp in descending order
    for m in messages: # Convert ObjectId to string for JSON serialization
        m["_id"] = str(m["_id"])  # convert ObjectId to string for JSON
    return {"history": messages[::-1]}  # reverse to oldest-first