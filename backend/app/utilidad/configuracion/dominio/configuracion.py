DEFAULT_CONFIG: dict[str, object] = {
    "restaurante": {
        "nombre_comercial": "UTTOF Restaurante",
        "ruc": "20601234567",
        "direccion": "Av. Larco 123, Miraflores, Lima",
        "telefono": "+51 999 999 999",
        "email": "admin@uttof.pe",
        "timezone": "America/Lima",
        "moneda": "PEN",
        "igv_pct": 18,
        "horario_apertura": "12:00",
        "horario_cierre": "23:00",
    },
    "pagos": {
        "acepta_efectivo": True,
        "acepta_tarjeta": True,
        "acepta_yape": True,
        "yape_numero": "+51 999 999 999",
        "pos_proveedor": "Niubiz",
        "propina_sugerida_pct": 10,
        "comprobante_default": "boleta",
    },
    "notificaciones": {
        "email_admin": "admin@uttof.pe",
        "email_reservas": True,
        "alertas_stock_bajo": True,
        "sonido_cocina": True,
        "resumen_diario_email": False,
    },
    "seguridad": {
        "sesion_minutos": 15,
        "mfa_admin": False,
        "intentos_login": 5,
        "bloqueo_minutos": 15,
        "rotacion_claves_dias": 90,
    },
}


def deep_merge(base: dict[str, object], changes: dict[str, object]) -> dict[str, object]:
    merged = dict(base)

    for key, value in changes.items():
        current = merged.get(key)
        if isinstance(current, dict) and isinstance(value, dict):
            merged[key] = deep_merge(current, value)
        else:
            merged[key] = value

    return merged
