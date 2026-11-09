import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)
SQLITE_DB_PATH = os.path.join(DATA_DIR, "legal_contracts.db")
SQLITE_URL = f"sqlite:///{SQLITE_DB_PATH}"

database_url = settings.DATABASE_URL

# Cấu hình engine với cơ chế tự động chuyển đổi an toàn (PostgreSQL -> SQLite fallback)
engine = None
try:
    if database_url and database_url.startswith("postgresql"):
        engine = create_engine(
            database_url,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True
        )
        with engine.connect() as conn:
            pass
        print("Connected to PostgreSQL database:", database_url.split("@")[-1])
    else:
        raise ValueError("Not a PostgreSQL URL, fallback to SQLite")
except Exception as e:
    # Tự động Fallback sang SQLite bền vững trên ổ cứng
    print(f"Using persistent SQLite storage at {SQLITE_DB_PATH} (Reason: {e})")
    engine = create_engine(
        SQLITE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI Dependency cung cấp Database Session chuẩn ACID"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Khởi tạo toàn bộ bảng trong cơ sở dữ liệu nếu chưa tồn tại"""
    from app.models import db_models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
