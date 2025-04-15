from openai import OpenAI # Import OpenAI for interacting with the OpenAI API
import os # Import os for environment variable access
from dotenv import load_dotenv # Import load_dotenv for loading environment variables from a .env file

load_dotenv() 
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) 

models = client.models.list()
for m in models:
    print(m.id)
