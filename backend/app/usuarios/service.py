from sqlalchemy.orm import Session

from app.auth.service import hash_password
from app.usuarios.model import Usuario
from app.usuarios.schema import UsuarioCreate


def crear_usuario(db: Session, data: UsuarioCreate) -> Usuario:
    usuario = Usuario(
        nombre=data.nombre,
        email=data.email,
        contrasena=hash_password(data.contrasena),
        telefono=data.telefono,
        preferencias_notas=data.preferencias_notas,
        alergias=data.alergias,
        id_rol=data.id_rol,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


def obtener_por_email(db: Session, email: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.email == email).first()


def obtener_por_id(db: Session, id_usuario: int) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
