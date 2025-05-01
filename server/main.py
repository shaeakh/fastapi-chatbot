from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):    
    text: str    
    role: str 

Conversation: List[Message] = []

@app.get("/")
def read_root():
    return {"msg": "welcome to shaeakhsbot"}

@app.get("/chat")
def get_full_convo():
    return Conversation

@app.post("/chat")
async def create_msgs(msg: Message):    
    Conversation.append(msg)    
    try:
        # Prepare the full conversation history for OpenAI
        messages = [{"role": "system", "content": "You are a helpful assistant who explains complex text simply."}]
        # Map roles to valid OpenAI roles
        role_map = {"ai": "assistant", "user": "user", "system": "system"}  # Add other mappings if needed
        for convo_msg in Conversation:
            # Use the mapped role if it exists, otherwise default to "user"
            openai_role = role_map.get(convo_msg.role.lower(), "user")
            messages.append({"role": openai_role, "content": convo_msg.text})

        # Call OpenAI API with the full conversation history
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=500,  # Adjust based on your needs
            temperature=0.7,  # Controls creativity
        )

        reply = response.choices[0].message.content
        
        # Store the AI's response in the conversation
        temp_msg = Message(text=reply, role="assistant")  # Use "assistant" for consistency
        Conversation.append(temp_msg)
        
        print("Conversation:", Conversation)
        return {"msg": temp_msg}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error from OpenAI API: {str(e)}")