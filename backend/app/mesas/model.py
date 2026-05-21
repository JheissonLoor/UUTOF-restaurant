from sqlalchemy import Column, Date, ForeignKey, Integer, String, Time
from sqlalchemy.orm import relationship

from app.database import Base


class Ubicacion(Base):
    __tablename__ = "ubicaciones"

    id_ubicacion = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False, unique=True)


class EstadoMesa(Base):
    __tablename__ = "estado_mesa"

    id_estado_mesa = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False, unique=True)


class Mesa(Base):
    __tablename__ = "mesas"

    id_mesa = Column(Integer, primary_key=True, index=True)
    numero = Column(Integer, nullable=False, unique=True)
    capacidad = Column(Integer, nullable=False)
    id_ubicacion = Column(Integer, ForeignKey("ubicaciones.id_ubicacion"))
    id_estado_mesa = Column(Integer, ForeignKey("estado_mesa.id_estado_mesa"))

    ubicacion = relationship("Ubicacion")
    estado_mesa = relationship("EstadoMesa")


class EstadoReserva(Base):
    __tablename__ = "estado_reserva"

    id_estado_reserva = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False, unique=True)


class Reserva(Base):
    __tablename__ = "reservas"

    id_reserva = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_mesa = Column(Integer, ForeignKey("mesas.id_mesa"))
    fecha_reserva = Column(Date, nullable=False)
    hora_reserva = Column(Time, nullable=False)
    num_personas = Column(Integer, nullable=False)
    id_estado_reserva = Column(Integer, ForeignKey("estado_reserva.id_estado_reserva"))
    notas_especiales = Column(String(255))

    usuario = relationship("Usuario")
    mesa = relationship("Mesa")
    estado_reserva = relationship("EstadoReserva")
