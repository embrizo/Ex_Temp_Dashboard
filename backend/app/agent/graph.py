from sqlalchemy.orm import Session

from langchain.agents import create_agent

from app.agent.llm import get_llm
from app.agent.tools import build_tools

SYSTEM_PROMPT = (
    "You are an assistant for a factory sensor monitoring dashboard. "
    "The hierarchy is Customer -> Factory -> Production Line -> Machine -> Sensor -> Readings. "
    "Always use the tools to look up real data before answering - never guess numbers. "
    "If the user names a sensor, call find_sensor first to resolve its id and confirm it exists "
    "before calling get_sensor_stats or list_alerts. Keep answers concise and grounded in the "
    "tool results; say so plainly if a sensor or data can't be found."
)


def build_agent(db: Session):
    """Returns None if the assistant isn't configured (no API key)."""
    llm = get_llm()
    if llm is None:
        return None
    tools = build_tools(db)
    return create_agent(llm, tools, system_prompt=SYSTEM_PROMPT)
