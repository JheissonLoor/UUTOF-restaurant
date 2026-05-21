from sqlalchemy import DECIMAL, Column, ForeignKey, Integer, SmallInteger, String
from sqlalchemy.orm import relationship

from app.database import Base


class Categoria(Base):
    __tablename__ = "categorias"

    id_categoria = Column(Integer, primary_key=True, index=True)
    nombre_categoria = Column(String(50), nullable=False, unique=True)
    descripcion = Column(String(255))


class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column(Integer, primary_key=True, index=True)
    id_categoria = Column(Integer, ForeignKey("categorias.id_categoria"))
    nombre_producto = Column(String(100), nullable=False)
    descripcion_corta = Column(String(255))
    precio_actual = Column(DECIMAL(10, 2), nullable=False)
    disponible = Column(SmallInteger, default=1)
    imagen_url = Column(String(255))

    categoria = relationship("Categoria")
