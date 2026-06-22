from datetime import date
from decimal import Decimal, ROUND_HALF_UP


ESTADOS_PEDIDO_DASHBOARD: tuple[tuple[str, str], ...] = (
    ("creado", "Creado"),
    ("en_cocina", "En cocina"),
    ("listo", "Listo"),
    ("entregado", "Entregado"),
    ("pagado", "Pagado"),
    ("cancelado", "Cancelado"),
)

ESTADO_MESA_STATUS = {
    "libre": "free",
    "ocupada": "occupied",
    "reservada": "reserved",
    "limpieza": "cleaning",
}


def validar_rango_fechas(from_date: date, to_date: date) -> None:
    if from_date > to_date:
        raise ValueError("La fecha 'from' no puede ser mayor que 'to'")


def decimal_2(value: Decimal | int | float | None) -> Decimal:
    if value is None:
        value = Decimal("0")
    if not isinstance(value, Decimal):
        value = Decimal(str(value))
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def porcentaje_delta(actual: Decimal | int, anterior: Decimal | int) -> Decimal:
    actual_d = decimal_2(actual)
    anterior_d = decimal_2(anterior)
    if anterior_d == 0:
        return Decimal("0.00")
    return decimal_2(((actual_d - anterior_d) / anterior_d) * Decimal("100"))


def porcentaje_parte(parte: int | Decimal, total: int | Decimal) -> Decimal:
    total_d = decimal_2(total)
    if total_d == 0:
        return Decimal("0.00")
    return decimal_2((Decimal(str(parte)) / total_d) * Decimal("100"))


def formato_tiempo_mesa(minutos: int | None, hora_reserva: str | None) -> str | None:
    if minutos is not None:
        if minutos < 60:
            return f"{minutos}m"
        horas = minutos // 60
        resto = minutos % 60
        return f"{horas}h {resto:02d}m"
    return hora_reserva


def estado_mesa_a_status(estado: str) -> str:
    return ESTADO_MESA_STATUS.get(estado, estado)
