from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.usuarios import service
from app.usuarios.schema import UsuarioCreate, UsuarioOut


router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.post("/", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def registrar(data: UsuarioCreate, db: Session = Depends(get_db)):
    if service.obtener_por_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email ya registrado")
    return service.crear_usuario(db, data)


@router.get("/{id_usuario}", response_model=UsuarioOut)
def obtener(id_usuario: int, db: Session = Depends(get_db)):
    usuario = service.obtener_por_id(db, id_usuario)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario
