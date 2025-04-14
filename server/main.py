# 🧠 Step 3: Add Starter Code to main.py
# This file will be the entry point for your FastAPI application.
# It will include the necessary imports and set up the FastAPI app.
from fastapi import FastAPI
from routes.chat import chat_router

app = FastAPI()
app.include_router(chat_router)

@app.get("/")
def root():
    return {"message": "FinChat AI backend is running 🚀"}
