from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

try:
    import email_validator
    from pydantic import EmailStr
except Exception:
    EmailStr = str

class UserRole(str, Enum):
    STUDENT = "STUDENT"
    ADMIN = "ADMIN"
    FACULTY = "FACULTY"

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)
    student_id: Optional[str] = None
    role: UserRole = UserRole.STUDENT

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    student_id: Optional[str] = None
    role: UserRole
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
