from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))

db = client["finchat"]
messages_collection = db["messages"]
#print("MONGO_URI:", os.getenv("MONGO_URI"))
#print("checking connection ->")
