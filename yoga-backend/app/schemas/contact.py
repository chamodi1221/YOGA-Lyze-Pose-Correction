from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class ContactCreate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    email: EmailStr | None = None
    message: str = Field(..., min_length=5, max_length=2000)


class AdminReplyUpdate(BaseModel):
    admin_reply: str = Field(..., min_length=1, max_length=2000)

class ContactResponse(BaseModel):
    id: int
    user_id: int | None = None
    name: str
    email: str
    message: str
    admin_reply: str | None = None
    status: str
    replied_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}