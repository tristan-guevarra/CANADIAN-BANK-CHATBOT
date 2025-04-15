from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

uri = os.getenv("MONGO_URI")

try:
    client = MongoClient(uri)
    db = client["finchat"]
    print("✅ Connected to MongoDB!")
    print("Collections:", db.list_collection_names())
except Exception as e:
    print("❌ Connection failed:", e)

# testing git commit
