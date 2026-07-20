import asyncio

from app.utilidad.realtime.infraestructura.manager import manager


async def emitir_metricas_periodicamente() -> None:
    while True:
        await asyncio.sleep(60)
        await manager.broadcast({"tipo": "metricas.tick"})
