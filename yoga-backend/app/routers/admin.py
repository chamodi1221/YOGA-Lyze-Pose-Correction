from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_user_dep
from app.schemas.token import TokenData
from app.models.user import User
from app.models.contact import ContactMessage

router = APIRouter(prefix="/admin", tags=["Admin"])

ADMIN_USERNAME = "yogalyzeadmin"


def get_user_identity(current_user: TokenData):
    return (
        getattr(current_user, "username", None)
        or getattr(current_user, "email", None)
        or getattr(current_user, "sub", None)
    )


def check_admin(current_user: TokenData):
    user_identity = get_user_identity(current_user)

    if user_identity != ADMIN_USERNAME:
        raise HTTPException(status_code=403, detail="Not authorized")


@router.get("/statistics")
def get_admin_statistics(
    current_user: TokenData = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    check_admin(current_user)

    total_users = db.query(User).count()
    total_messages = db.query(ContactMessage).count()
    pending_messages = (
        db.query(ContactMessage)
        .filter(ContactMessage.status == "pending")
        .count()
    )
    replied_messages = (
        db.query(ContactMessage)
        .filter(ContactMessage.status == "replied")
        .count()
    )

    return {
        "total_users": total_users,
        "total_messages": total_messages,
        "pending_messages": pending_messages,
        "replied_messages": replied_messages,
    }