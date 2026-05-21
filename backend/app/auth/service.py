from datetime import datetime, timedelta
from os import getenv
from pathlib import Path

from dotenv import load_dotenv
from jose import jwt
from passlib.context import CryptContext


ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_PATH)

SECRET_KEY = getenv("SECRET_KEY", "clave_secreta")
ALGORITHM = getenv("ALGORITHM", "HS256")
EXPIRE_MIN = int(getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=EXPIRE_MIN)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
