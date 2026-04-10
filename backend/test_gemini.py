import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("GEMINI_API_KEY")
print(f"Using key: {key[:10]}...")

genai.configure(api_key=key)

def get_balance(address: str):
    """Get balance."""
    return {"balance": "100 OKB"}

model = genai.GenerativeModel("gemini-3-flash-preview", tools=[get_balance])
chat = model.start_chat(enable_automatic_function_calling=True)

try:
    response = chat.send_message("What is my balance for 0x123?")
    print(f"Response: {response.text}")
except Exception as e:
    import traceback
    print(f"Error: {e}")
    traceback.print_exc()
