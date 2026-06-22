ESTADOS_ITEM = {"en_cocina", "ready", "delivered"}


def puede_entregar_item(estado_actual: str) -> bool:
    return estado_actual == "ready"
