from typing import List, Dict, Any, Type, Optional
from openai import AsyncOpenAI, AsyncAzureOpenAI
import json
from pydantic import BaseModel
from app.config import settings

class BaseAgent:
    def __init__(self, role: str, system_prompt: str, model: str = None):
        self.role = role
        self.system_prompt = system_prompt
        self.model = model or settings.MODEL_NAME
        
        if settings.OPENAI_API_TYPE.lower() == "azure":
            self.client = AsyncAzureOpenAI(
                api_key=settings.OPENAI_API_KEY,
                api_version=settings.AZURE_OPENAI_API_VERSION,
                azure_endpoint=settings.AZURE_OPENAI_ENDPOINT
            )
        else:
            client_kwargs = {"api_key": settings.OPENAI_API_KEY}
            if settings.OPENAI_BASE_URL:
                client_kwargs["base_url"] = settings.OPENAI_BASE_URL
            self.client = AsyncOpenAI(**client_kwargs)
            
    async def generate_response(self, prompt: str, transcript: List[Dict[str, Any]]) -> str:
        messages = [{"role": "system", "content": self.system_prompt}]
        
        # Build context from transcript
        if transcript:
            context = "Previous Debate Context:\n"
            for turn in transcript:
                context += f"Round {turn['round']} - {turn['agent']} ({turn['type']}):\n{turn['content']}\n\n"
            messages.append({"role": "user", "content": context})
            
        messages.append({"role": "user", "content": prompt})
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        return response.choices[0].message.content.strip()

    async def generate_structured_response(self, prompt: str, transcript: List[Dict[str, Any]], schema: Type[BaseModel]) -> BaseModel:
        messages = [{"role": "system", "content": self.system_prompt}]
        
        if transcript:
            context = "Debate Transcript:\n"
            for turn in transcript:
                context += f"Round {turn['round']} - {turn['agent']} ({turn['type']}):\n{turn['content']}\n\n"
            messages.append({"role": "user", "content": context})
            
        messages.append({"role": "user", "content": prompt})
        
        # We will use parse if supported, otherwise basic JSON mode
        # openai sdk supports beta.chat.completions.parse for strict structured outputs
        try:
            response = await self.client.beta.chat.completions.parse(
                model=self.model,
                messages=messages,
                response_format=schema,
                temperature=0.2
            )
            return response.choices[0].message.parsed
        except Exception as e:
            # Fallback to JSON mode if parsing fails or model doesn't support structured outputs
            schema_json = schema.model_json_schema()
            messages[0]["content"] += f"\nReturn ONLY valid JSON matching this schema:\n{json.dumps(schema_json)}"
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.2
            )
            raw_json = response.choices[0].message.content
            return schema.model_validate_json(raw_json)
