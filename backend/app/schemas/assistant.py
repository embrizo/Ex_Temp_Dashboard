from pydantic import BaseModel


class AssistantRequest(BaseModel):
    question: str
    scope_sensor_id: str | None = None


class AssistantResponse(BaseModel):
    answer: str
