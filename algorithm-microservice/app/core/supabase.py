from dotenv import load_dotenv
import os
from supabase import create_client, Client

load_dotenv()

url = str(os.getenv("SUPABASE_URL"))
key = str(os.getenv("SUPABASE_KEY"))

supabase: Client = create_client(url, key)
