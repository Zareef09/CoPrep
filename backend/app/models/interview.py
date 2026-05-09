from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel


class InterviewSession(SQLModel, table=True):
    id: str = Field(primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    role: str
    company: Optional[str] = None
    num_questions: int
    current_question: int = 1
    messages_json: str = Field(default="[]")  # JSON-serialised list of {role, content}
    is_complete: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
