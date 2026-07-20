from datetime import datetime, time
from zoneinfo import ZoneInfo

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.tarea.prediccion_flow.dominio.prediccion import (
    AccionRecomendacion,
    calcular_confianza,
    detectar_picos,
)
from app.tarea.prediccion_flow.infraestructura import repo
from app.tarea.prediccion_flow.infraestructura.schemas import (
    AccionRecomendacionResponse,
    PrediccionResponse,
    PronosticoPunto,
    Recomendacion,
)


LIMA = ZoneInfo("America/Lima")


async def obtener_prediccion(
    session: AsyncSession,
    *,
    id_sucursal: int | None,
) -> PrediccionResponse:
    rows = await repo.demanda_por_hora(session, id_sucursal=id_sucursal)
    demanda = {int(row["hora"]): float(row["demanda"] or 0) for row in rows}
    muestras = sum(int(row["muestras"] or 0) for row in rows)
    pronostico_dict = [
        {"hora": f"{hora:02d}:00", "demanda": round(demanda.get(hora, 0), 1)}
        for hora in range(11, 23)
    ]

    recomendaciones = await _recomendaciones(
        session,
        id_sucursal=id_sucursal,
        pronostico=pronostico_dict,
    )
    acciones = await repo.acciones_registradas(session, id_sucursal=id_sucursal)
    recomendaciones = [item for item in recomendaciones if item.id not in acciones]
    hoy = datetime.now(LIMA).date()
    recalculado = datetime.combine(hoy, time(hour=3), tzinfo=LIMA)
    return PrediccionResponse(
        modelo="v2.4",
        confianza=calcular_confianza(muestras),
        recalculado_en=recalculado.isoformat(),
        pronostico=[PronosticoPunto(**punto) for punto in pronostico_dict],
        picos=detectar_picos(pronostico_dict),
        recomendaciones=recomendaciones,
    )


async def _recomendaciones(
    session: AsyncSession,
    *,
    id_sucursal: int | None,
    pronostico: list[dict[str, float | str]],
) -> list[Recomendacion]:
    scope = str(id_sucursal) if id_sucursal is not None else "red"
    stamp = datetime.now(LIMA).strftime("%Y%m%d")
    resultado: list[Recomendacion] = []

    inventario = await repo.insumo_prioritario(session, id_sucursal=id_sucursal)
    if inventario:
        resultado.append(
            Recomendacion(
                id=f"comprar-{scope}-{inventario['id_insumo']}-{stamp}",
                tipo="comprar",
                texto=(
                    f"Comprar {float(inventario['sugerido']):g} {inventario['unidad']} de "
                    f"{inventario['nombre']} para {inventario['sucursal']}"
                ),
                impacto="Reduce el riesgo de quiebre de stock",
            )
        )

    punto_maximo = max(pronostico, key=lambda punto: float(punto["demanda"]), default=None)
    if punto_maximo and float(punto_maximo["demanda"]) > 0:
        resultado.append(
            Recomendacion(
                id=f"staff-{scope}-{stamp}",
                tipo="staff",
                texto=f"Reforzar el turno de servicio desde las {punto_maximo['hora']}",
                impacto="Mejora la capacidad durante el pico estimado",
            )
        )

    platillo = await repo.platillo_destacado(session, id_sucursal=id_sucursal)
    if platillo:
        resultado.append(
            Recomendacion(
                id=f"menu-{scope}-{platillo['id_platillo']}-{stamp}",
                tipo="menu",
                texto=f"Destacar {platillo['nombre']} en la carta de hoy",
                impacto=f"Es el plato con mayor demanda reciente ({int(platillo['cantidad'])} unidades)",
            )
        )
    return resultado


async def aplicar_recomendacion(
    session: AsyncSession,
    *,
    id_recomendacion: str,
    accion: AccionRecomendacion,
    id_sucursal: int | None,
    id_usuario: int,
) -> AccionRecomendacionResponse:
    tipo = id_recomendacion.split("-", maxsplit=1)[0]
    if tipo not in {"comprar", "staff", "menu"}:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Identificador de recomendación inválido",
        )
    await repo.registrar_accion(
        session,
        id_recomendacion=id_recomendacion,
        id_sucursal=id_sucursal,
        tipo=tipo,
        accion=accion,
        id_usuario=id_usuario,
    )
    return AccionRecomendacionResponse(id=id_recomendacion, accion=accion, ok=True)
