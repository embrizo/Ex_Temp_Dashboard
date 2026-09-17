from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.agent.graph import build_agent
from app.deps import get_db, require_auth
from app.schemas.assistant import AssistantRequest, AssistantResponse

router = APIRouter(tags=["assistant"], dependencies=[Depends(require_auth)])


@router.post("/assistant", response_model=AssistantResponse)
def ask_assistant(payload: AssistantRequest, db: Session = Depends(get_db)):
    agent = build_agent(db)
    if agent is None:
        raise HTTPException(
            status_code=503,
            detail="AI assistant is not configured (ANTHROPIC_API_KEY is not set on the server).",
        )

    question = payload.question
    if payload.scope_sensor_id:
        question = f"[Currently viewing sensor_id={payload.scope_sensor_id}] {question}"

    try:
        result = agent.invoke({"messages": [{"role": "user", "content": question}]})
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Assistant request failed: {exc}")

    messages = result.get("messages", [])
    if not messages:
        raise HTTPException(status_code=502, detail="Assistant returned no response")

    return AssistantResponse(answer=messages[-1].content)
