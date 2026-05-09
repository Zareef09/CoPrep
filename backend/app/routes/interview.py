import json
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from app import auth, llm
from app.database import get_session
from app.models.interview import InterviewSession
from app.models.user import User

router = APIRouter(prefix="/interview", tags=["interview"])


# ── Request / Response models ──────────────────────────────────────────────────

class StartRequest(BaseModel):
    role: str
    company: str | None = None
    num_questions: int = Field(default=5, ge=3, le=10)


class StartResponse(BaseModel):
    session_id: str
    message: str
    question_number: int
    total_questions: int
    is_complete: bool


class RespondRequest(BaseModel):
    session_id: str
    answer: str


class RespondResponse(BaseModel):
    session_id: str
    message: str
    question_number: int
    total_questions: int
    is_complete: bool


class SessionSummary(BaseModel):
    session_id: str
    role: str
    company: str | None
    num_questions: int
    is_complete: bool
    created_at: str


# ── Helpers ────────────────────────────────────────────────────────────────────

def _system_prompt(role: str, company: str | None, num_questions: int) -> str:
    at = f" at {company}" if company else ""
    return (
        f"You are an expert interviewer helping a candidate practise for a {role} position{at}.\n\n"
        f"Rules:\n"
        f"- Ask exactly {num_questions} questions total, one at a time.\n"
        f"- After each answer give 2-3 sentences of specific, constructive feedback.\n"
        f"- Then ask the next question.\n"
        f"- After question {num_questions}, give an overall assessment instead of a new question.\n\n"
        f"Mix behavioral (STAR), situational, and role-specific questions. "
        f"Be encouraging but honest.\n\n"
        f"Start: greet the candidate warmly, explain the format in one sentence, then ask question 1."
    )


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/start", response_model=StartResponse)
def start_interview(
    req: StartRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(auth.get_current_user),
):
    messages = [
        {"role": "system", "content": _system_prompt(req.role, req.company, req.num_questions)},
        {"role": "user", "content": "Begin the interview."},
    ]
    first_message = llm.chat(messages)
    messages.append({"role": "assistant", "content": first_message})

    session = InterviewSession(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        role=req.role,
        company=req.company,
        num_questions=req.num_questions,
        messages_json=json.dumps(messages),
    )
    db.add(session)
    db.commit()

    return StartResponse(
        session_id=session.id,
        message=first_message,
        question_number=1,
        total_questions=req.num_questions,
        is_complete=False,
    )


@router.post("/respond", response_model=RespondResponse)
def respond(
    req: RespondRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(auth.get_current_user),
):
    session = db.get(InterviewSession, req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your session")
    if session.is_complete:
        raise HTTPException(status_code=400, detail="Interview already complete")

    messages = json.loads(session.messages_json)
    messages.append({"role": "user", "content": req.answer})
    reply = llm.chat(messages)
    messages.append({"role": "assistant", "content": reply})

    is_complete = session.current_question >= session.num_questions
    next_q = session.current_question if is_complete else session.current_question + 1

    session.messages_json = json.dumps(messages)
    session.current_question = next_q
    session.is_complete = is_complete
    db.add(session)
    db.commit()

    return RespondResponse(
        session_id=req.session_id,
        message=reply,
        question_number=next_q,
        total_questions=session.num_questions,
        is_complete=is_complete,
    )


@router.get("/history", response_model=list[SessionSummary])
def history(
    db: Session = Depends(get_session),
    current_user: User = Depends(auth.get_current_user),
):
    sessions = db.exec(
        select(InterviewSession)
        .where(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.created_at.desc())
    ).all()
    return [
        SessionSummary(
            session_id=s.id,
            role=s.role,
            company=s.company,
            num_questions=s.num_questions,
            is_complete=s.is_complete,
            created_at=s.created_at,
        )
        for s in sessions
    ]
