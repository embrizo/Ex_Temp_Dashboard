from langchain_anthropic import ChatAnthropic

from app.config import settings


def get_llm():
    """Returns None if no API key is configured, so callers can degrade
    gracefully (503) instead of failing deep inside LangGraph."""
    if not settings.anthropic_api_key:
        return None
    return ChatAnthropic(model=settings.assistant_model, api_key=settings.anthropic_api_key, temperature=0)
