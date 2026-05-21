from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Rol(Base):
    __tablename__ = "roles"

    id_rol = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False, unique=True)


class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    contrasena = Column(String(255), nullable=False)
    telefono = Column(String(20))
    preferencias_notas = Column(Text)
    alergias = Column(String(255))
    id_rol = Column(Integer, ForeignKey("roles.id_rol"), nullable=False, default=1)
    fecha_registro = Column(DateTime, default=datetime.utcnow)

    rol = relationship("Rol")
