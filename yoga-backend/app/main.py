from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.security import get_password_hash
from app.database import Base, SessionLocal, engine
from app.models.user import User
from app.routers.auth import router as auth_router
from app.routers.pose import router as pose_router
from app.routers.contact import router as contact_router, admin_router as admin_contact_router
from app.routers.admin import router as admin_router
from app.services import pose_service  # pre-load MoveNet on startup


def _run_schema_updates():
    statements = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR NOT NULL DEFAULT 'user';",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;",
        "ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS user_id INTEGER;",
        "ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS admin_reply TEXT;",
        "ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending';",
        "ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;",
        "ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();",
    ]

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


def _ensure_admin_user():
    admin_username = "yogalyzeadmin"
    admin_password = "admin123"
    admin_email = "yogalyzeadmin@gmail.com"

    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.username == admin_username).first()

        if admin_user is None:
            admin_user = User(
                username=admin_username,
                email=admin_email,
                hashed_password=get_password_hash(admin_password),
                role="admin",
                is_active=True,
            )
            db.add(admin_user)
        else:
            admin_user.email = admin_email
            admin_user.hashed_password = get_password_hash(admin_password)
            admin_user.role = "admin"
            admin_user.is_active = True

        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm up MoveNet TFLite model so the first request isn't slow
    pose_service.get_model()
    yield


# Create all DB tables on startup
Base.metadata.create_all(bind=engine)
_run_schema_updates()
_ensure_admin_user()

app = FastAPI(title="YogaProject API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(pose_router)
app.include_router(contact_router)
app.include_router(admin_contact_router)
app.include_router(admin_router)