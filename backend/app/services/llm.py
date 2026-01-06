import json
import time
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage
from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.submissions import LLMOutput
from app.services.prompts import get_system_prompt, get_user_prompt

logger = get_logger(__name__)


class LLMClient:
    """handles interaction with llm providers (groq, openai, or mock) using langchain"""
    
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.api_key = settings.llm_api_key
        self.model = settings.LLM_MODEL
        self.timeout = settings.LLM_TIMEOUT_SECONDS
        self.max_retries = settings.LLM_MAX_RETRIES
        
        # initialize the appropriate llm client based on provider
        if self.provider == "groq":
            self.llm = ChatGroq(
                model=self.model,
                groq_api_key=self.api_key,
                temperature=0.7,
                timeout=self.timeout,
                max_retries=self.max_retries
            )
        elif self.provider == "openai":
            self.llm = ChatOpenAI(
                model=self.model,
                openai_api_key=self.api_key,
                temperature=0.7,
                timeout=self.timeout,
                max_retries=self.max_retries
            )
    
    def generate(self, review_text: str, rating: int):
        """generates an llm response for the given review and rating"""
        if self.provider == "mock":
            return self._mock_generate(review_text, rating)
        elif self.provider in ["openai", "groq"]:
            return self._llm_generate(review_text, rating)
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")
        
    def _llm_generate(self, review_text: str, rating: int):
        """sends the review to the llm api and returns the parsed response"""
        try:
            messages = [
                SystemMessage(content=get_system_prompt()),
                HumanMessage(content=get_user_prompt(rating, review_text))
            ]
            
            response = self.llm.invoke(messages)
            content = response.content
            
            return self._parse_llm_response(content)
            
        except Exception as e:
            logger.error(f"{self.provider.upper()} API call failed: {str(e)}")
            raise Exception(f"LLM request failed: {str(e)}")
    
    def _parse_llm_response(self, content: str):
        """tries to extract and validate the json from the llm response"""
        try:
            # first attempt: parse as json directly
            data = json.loads(content)
            return LLMOutput(**data)
        except (json.JSONDecodeError, ValueError) as e:
            logger.warning(f"Failed to parse LLM response: {str(e)}")
            
            # fallback: extract json object from response text
            try:
                start = content.find('{')
                end = content.rfind('}') + 1
                if start >= 0 and end > start:
                    json_str = content[start:end]
                    data = json.loads(json_str)
                    return LLMOutput(**data)
            except Exception:
                pass
            
            raise ValueError(f"Invalid LLM response format: {content[:200]}")


# create global llm client instance
llm_client = LLMClient()
