from datetime import datetime

from sqlalchemy import DECIMAL, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class MetodoPago(Base):
    __tablename__ = "metodo_pago"

    id_metodo_pago = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False, unique=True)


class Pago(Base):
    __tablename__ = "pagos"

    id_pago = Column(Integer, primary_key=True, index=True)
    id_pedido = Column(Integer, ForeignKey("pedidos.id_pedido"))
    id_metodo_pago = Column(Integer, ForeignKey("metodo_pago.id_metodo_pago"))
    subtotal = Column(DECIMAL(10, 2), nullable=False)
    propina = Column(DECIMAL(10, 2), default=0)
    total_pagado = Column(DECIMAL(10, 2), nullable=False)
    fecha_pago = Column(DateTime, default=datetime.utcnow)
    transaccion_id = Column(String(100))

    pedido = relationship("Pedido")
    metodo_pago = relationship("MetodoPago")
