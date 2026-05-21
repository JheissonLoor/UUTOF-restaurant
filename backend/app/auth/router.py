from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import service as auth_service
from app.auth.schema import LoginInput, RegisterInput, RegisterOut, TokenOut
from app.database import get_db
from app.usuarios import service as user_service


router = APIRouter(prefix="/auth", tags=["Autenticacion"])


@router.post("/register", response_model=RegisterOut, status_code=status.HTTP_201_CREATED)
def register(data: RegisterInput, db: Session = Depends(get_db)):
    if user_service.obtener_por_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email ya registrado")
    return user_service.crear_usuario(db, data)


@router.post("/login", response_model=TokenOut)
def login(data: LoginInput, db: Session = Depends(get_db)):
    usuario = user_service.obtener_por_email(db, data.email)
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales invalidas")

    if not auth_service.verify_password(data.contrasena, usuario.contrasena):
        raise HTTPException(status_code=401, detail="Credenciales invalidas")

    token = auth_service.create_token(
        {
            "sub": str(usuario.id_usuario),
            "email": usuario.email,
            "rol": usuario.id_rol,
        }
    )
    return {"access_token": token}
