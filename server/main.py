# File: main.py
# Project: FinChat AI
# This file will be the entry point for your FastAPI application.
# It will include the necessary imports and set up the FastAPI app
from fastapi.middleware.cors import CORSMiddleware
#Since frontend (localhost:3000) is calling backend (localhost:8000), we need to allow CORS.
# CORS (Cross-Origin Resource Sharing) is a security feature implemented by web browsers to restrict web pages from making requests to a different domain than the one that served the web page.
from fastapi import FastAPI
from routes.chat import chat_router
from routes.history import history_router  # Import the history router


app = FastAPI() # Create an instance of FastAPI

app.add_middleware( # Add CORS middleware to the FastAPI app
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router) # Include the chat router
app.include_router(history_router)  # Include the history router


@app.get("/") # Define a root endpoint
def root(): # This is the root endpoint of the FastAPI application.
    return {"message": "FinChat AI backend is running 🚀"} 
