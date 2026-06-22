from decimal import Decimal


def validar_precio(precio: Decimal) -> None:
    if precio < 0:
        raise ValueError("El precio no puede ser negativo")


def normalizar_limit(limit: int) -> int:
    return min(max(limit, 1), 50)
