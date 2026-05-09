import os
from sqlmodel import SQLModel, create_engine, Session

_url = os.environ.get("DATABASE_URL", "sqlite:///./coprep.db")

# Some PostgreSQL providers (older Heroku, some Render configs) emit
# "postgres://" which SQLAlchemy 1.4+ rejects — normalise it.
if _url.startswith("postgres://"):
    _url = _url.replace("postgres://", "postgresql://", 1)

_connect_args = {"check_same_thread": False} if _url.startswith("sqlite") else {}
engine = create_engine(_url, connect_args=_connect_args)


def create_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
