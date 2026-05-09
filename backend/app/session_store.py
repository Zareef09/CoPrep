import uuid
from datetime import datetime, timezone
from threading import Lock

_sessions: dict[str, dict] = {}
_lock = Lock()


def create(role: str, company: str | None, num_questions: int) -> dict:
    session = {
        "session_id": str(uuid.uuid4()),
        "role": role,
        "company": company,
        "num_questions": num_questions,
        "current_question": 1,
        "messages": [],
        "is_complete": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    with _lock:
        _sessions[session["session_id"]] = session
    return session


def get(session_id: str) -> dict | None:
    with _lock:
        return _sessions.get(session_id)


def patch(session_id: str, **kwargs) -> None:
    with _lock:
        if session_id in _sessions:
            _sessions[session_id].update(kwargs)
