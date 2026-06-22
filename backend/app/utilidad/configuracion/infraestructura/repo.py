import json
import os
from pathlib import Path
from typing import Any

from app.utilidad.configuracion.dominio.configuracion import DEFAULT_CONFIG, deep_merge
from app.utilidad.configuracion.infraestructura.schemas import ConfiguracionResponse


def _store_path() -> Path:
    configured_path = os.getenv("UTTOF_CONFIG_FILE")
    if configured_path:
        return Path(configured_path)
    return Path(__file__).resolve().parents[4] / "storage" / "configuracion.json"


def _read_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as file:
        data = json.load(file)
    return data if isinstance(data, dict) else {}


async def obtener_configuracion() -> ConfiguracionResponse:
    stored = _read_json(_store_path())
    merged = deep_merge(DEFAULT_CONFIG, stored)
    return ConfiguracionResponse.model_validate(merged)


async def guardar_configuracion(changes: dict[str, Any]) -> ConfiguracionResponse:
    path = _store_path()
    current = deep_merge(DEFAULT_CONFIG, _read_json(path))
    updated = deep_merge(current, changes)
    validated = ConfiguracionResponse.model_validate(updated)

    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        json.dump(validated.model_dump(), file, ensure_ascii=False, indent=2)

    return validated
