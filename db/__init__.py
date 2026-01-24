from .base import Base, engine, SessionLocal
from contextlib import contextmanager



@contextmanager
def session_scope():
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()

def get_session():
    return SessionLocal()