import re


def normalizar_telefono_peru(value: str | None) -> str | None:
    if value is None or not value.strip():
        return None

    digits = re.sub(r"\D", "", value)
    if digits.startswith("51"):
        digits = digits[2:]
    if not re.fullmatch(r"9\d{8}", digits):
        raise ValueError("El telefono debe ser un celular peruano valido")
    return f"+51{digits}"
