from datetime import datetime

from sqlalchemy import DECIMAL, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class EstadoPedido(Base):
    __tablename__ = "estado_pedido"

    id_estado_pedido = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False, unique=True)


class Pedido(Base):
    __tablename__ = "pedidos"

    id_pedido = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_mesa = Column(Integer, ForeignKey("mesas.id_mesa"))
    fecha_pedido = Column(DateTime, default=datetime.utcnow)
    id_estado_pedido = Column(Integer, ForeignKey("estado_pedido.id_estado_pedido"))
    total = Column(DECIMAL(10, 2), default=0)

    usuario = relationship("Usuario")
    mesa = relationship("Mesa")
    estado_pedido = relationship("EstadoPedido")
    detalles = relationship("DetallePedido", back_populates="pedido")


class EstadoItem(Base):
    __tablename__ = "estado_item"

    id_estado_item = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False, unique=True)


class DetallePedido(Base):
    __tablename__ = "detalle_pedido"

    id_detalle = Column(Integer, primary_key=True, index=True)
    id_pedido = Column(Integer, ForeignKey("pedidos.id_pedido"))
    id_producto = Column(Integer, ForeignKey("productos.id_producto"))
    cantidad = Column(Integer, nullable=False)
    precio_unitario_fijo = Column(DECIMAL(10, 2), nullable=False)
    notas_producto = Column(String(150))
    id_estado_item = Column(Integer, ForeignKey("estado_item.id_estado_item"))

    pedido = relationship("Pedido", back_populates="detalles")
    producto = relationship("Producto")
    estado = relationship("EstadoItem")
