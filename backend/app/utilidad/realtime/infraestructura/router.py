from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.utilidad.auth.dominio import token as auth_token
from app.utilidad.realtime.infraestructura.manager import manager


router = APIRouter(tags=["Realtime"])


@router.websocket("/ws")
async def realtime_socket(websocket: WebSocket, token: str = Query(min_length=1)) -> None:
    try:
        payload = auth_token.verify(token, token_type="access")
    except ValueError:
        await websocket.close(code=4401, reason="Token invalido")
        return

    if payload.get("rol") not in {"cliente", "mesero", "cocina", "admin"}:
        await websocket.close(code=4403, reason="Rol no autorizado")
        return

    await manager.connect(websocket)
    try:
        while True:
            message = await websocket.receive_text()
            if message == "ping":
                await websocket.send_json({"tipo": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
