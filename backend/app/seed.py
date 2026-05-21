from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.mesas.model import EstadoMesa, EstadoReserva, Ubicacion
from app.pagos.model import MetodoPago
from app.pedidos.model import EstadoItem, EstadoPedido
from app.usuarios.model import Rol


def _create_if_missing(db: Session, model, id_field: str, name_field: str, values: list[tuple[int, str]]) -> None:
    for item_id, name in values:
        exists = db.get(model, item_id)
        if not exists:
            db.add(model(**{id_field: item_id, name_field: name}))


def seed_initial_data() -> None:
    db = SessionLocal()
    try:
        _create_if_missing(
            db,
            Rol,
            "id_rol",
            "nombre",
            [
                (1, "Cliente"),
                (2, "Cocina"),
                (3, "Verificador"),
                (4, "Administrador"),
            ],
        )
        _create_if_missing(
            db,
            Ubicacion,
            "id_ubicacion",
            "nombre",
            [
                (1, "Salon"),
                (2, "Terraza"),
                (3, "Privado"),
            ],
        )
        _create_if_missing(
            db,
            EstadoMesa,
            "id_estado_mesa",
            "nombre",
            [
                (1, "Libre"),
                (2, "Ocupada"),
                (3, "Reservada"),
            ],
        )
        _create_if_missing(
            db,
            EstadoReserva,
            "id_estado_reserva",
            "nombre",
            [
                (1, "Pendiente"),
                (2, "Confirmada"),
                (3, "Cancelada"),
            ],
        )
        _create_if_missing(
            db,
            EstadoPedido,
            "id_estado_pedido",
            "nombre",
            [
                (1, "En espera"),
                (2, "Cancelado"),
                (3, "En preparacion"),
                (4, "Entregado"),
                (5, "Pendiente de pago"),
                (6, "Pagado"),
            ],
        )
        _create_if_missing(
            db,
            EstadoItem,
            "id_estado_item",
            "nombre",
            [
                (1, "Pendiente"),
                (2, "En preparacion"),
                (3, "Listo"),
                (4, "Entregado"),
            ],
        )
        _create_if_missing(
            db,
            MetodoPago,
            "id_metodo_pago",
            "nombre",
            [
                (1, "Tarjeta"),
                (2, "Efectivo"),
                (3, "Billetera digital"),
                (4, "Transferencia"),
            ],
        )
        db.commit()
    finally:
        db.close()
