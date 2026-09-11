import asyncio
import sys
from datetime import datetime, timedelta
from pathlib import Path
from uuid import uuid4
from zoneinfo import ZoneInfo

import httpx
from sqlalchemy import text

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.db.client import AsyncSessionLocal, engine


API_URL = "http://127.0.0.1:8000/v1"
LIMA_TZ = ZoneInfo("America/Lima")


def auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def login(client: httpx.AsyncClient, email: str, password: str) -> dict:
    response = await client.post("/auth/login", json={"email": email, "password": password})
    response.raise_for_status()
    return response.json()


async def cleanup(id_usuario: int | None, id_pedido: int | None, id_reserva: int | None, id_mesa: int | None) -> None:
    async with AsyncSessionLocal() as session:
        if id_reserva is not None:
            await session.execute(
                text("DELETE FROM reserva WHERE id_reserva = :id_reserva"),
                {"id_reserva": id_reserva},
            )
        if id_pedido is not None:
            await session.execute(
                text("DELETE FROM pedido_insumo_alerta WHERE id_pedido = :id_pedido"),
                {"id_pedido": id_pedido},
            )
            await session.execute(
                text("DELETE FROM pago WHERE id_pedido = :id_pedido"),
                {"id_pedido": id_pedido},
            )
            await session.execute(
                text("DELETE FROM detalle_pedido WHERE id_pedido = :id_pedido"),
                {"id_pedido": id_pedido},
            )
            await session.execute(
                text("DELETE FROM pedido WHERE id_pedido = :id_pedido"),
                {"id_pedido": id_pedido},
            )
        if id_mesa is not None:
            await session.execute(
                text("UPDATE mesa SET estado = 'libre' WHERE id_mesa = :id_mesa"),
                {"id_mesa": id_mesa},
            )
        if id_usuario is not None:
            await session.execute(
                text("DELETE FROM preferencia_cliente WHERE id_usuario = :id_usuario"),
                {"id_usuario": id_usuario},
            )
            await session.execute(
                text("DELETE FROM usuario WHERE id_usuario = :id_usuario"),
                {"id_usuario": id_usuario},
            )
        await session.commit()


async def verify() -> None:
    id_usuario: int | None = None
    id_pedido: int | None = None
    id_reserva: int | None = None
    id_mesa: int | None = None

    async with httpx.AsyncClient(base_url=API_URL, timeout=15) as client:
        try:
            admin = await login(client, "admin@uttof.pe", "admin123")
            cocina = await login(client, "cocina@uttof.pe", "cocina123")
            mesero = await login(client, "mesero@uttof.pe", "mesero123")

            mesas_response = await client.get("/mesas", headers=auth(admin["access_token"]))
            mesas_response.raise_for_status()
            mesas_libres = [mesa for mesa in mesas_response.json() if mesa["estado"] == "libre"]
            if not mesas_libres:
                raise RuntimeError("No hay una mesa libre para la verificacion")
            mesa = mesas_libres[0]
            id_mesa = int(mesa["id_mesa"])

            qr_response = await client.get(f"/mesas/{id_mesa}/qr", headers=auth(admin["access_token"]))
            qr_response.raise_for_status()
            qr = qr_response.json()
            if len(qr["codigo_corto"]) != 12 or "/mesa/" not in qr["qr_url"]:
                raise AssertionError("El QR de mesa no cumple el contrato seguro")

            checkin_response = await client.post("/mesas/checkin/qr", json={"token_o_codigo": qr["codigo_corto"]})
            checkin_response.raise_for_status()
            guest = checkin_response.json()["sesion"]
            id_usuario = int(guest["usuario"]["id_usuario"])
            if not guest["usuario"]["es_invitado"]:
                raise AssertionError("El check-in sin cuenta no creo una sesion invitada")

            reserva_guest = await client.post(
                "/reservas",
                headers=auth(guest["access_token"]),
                json={
                    "id_mesa": id_mesa,
                    "hora_reserva": (datetime.now(LIMA_TZ) + timedelta(days=5)).isoformat(),
                    "num_personas": 2,
                },
            )
            if reserva_guest.status_code != 403:
                raise AssertionError("Una sesion invitada no debe poder reservar")

            menu_response = await client.get("/menu/platillos", params={"limit": 1})
            menu_response.raise_for_status()
            platillo = menu_response.json()["data"][0]

            pedido_response = await client.post(
                "/pedidos",
                headers=auth(guest["access_token"]),
                json={"id_mesa": id_mesa, "items": [{"id_platillo": platillo["id_platillo"], "qty": 1}]},
            )
            pedido_response.raise_for_status()
            pedido = pedido_response.json()
            id_pedido = int(pedido["id_pedido"])

            propios_response = await client.get("/pedidos/mios", headers=auth(guest["access_token"]))
            propios_response.raise_for_status()
            if id_pedido not in {int(item["id_pedido"]) for item in propios_response.json()}:
                raise AssertionError("El pedido no aparece en el historial del cliente")

            cocina_response = await client.get("/pedidos", headers=auth(cocina["access_token"]))
            cocina_response.raise_for_status()
            if id_pedido not in {int(item["id_pedido"]) for item in cocina_response.json()}:
                raise AssertionError("El pedido no llego a cocina")

            detalle_response = await client.get(f"/pedidos/{id_pedido}", headers=auth(guest["access_token"]))
            detalle_response.raise_for_status()
            id_detalle = int(detalle_response.json()["items"][0]["id_detalle"])

            listo_response = await client.patch(
                f"/pedidos/{id_pedido}/items/{id_detalle}",
                headers=auth(cocina["access_token"]),
                json={"listo": True},
            )
            listo_response.raise_for_status()

            entregado_response = await client.patch(
                f"/pedidos/{id_pedido}/items/{id_detalle}/entregar",
                headers=auth(admin["access_token"]),
            )
            entregado_response.raise_for_status()
            if entregado_response.json()["estado"] != "entregado":
                raise AssertionError("El pedido no avanzo a entregado")

            cuenta_response = await client.post(
                f"/pedidos/{id_pedido}/cuenta",
                headers=auth(guest["access_token"]),
            )
            cuenta_response.raise_for_status()
            total = cuenta_response.json()["total"]

            pago_response = await client.post(
                "/pagos",
                headers=auth(guest["access_token"]),
                json={"id_pedido": id_pedido, "metodo": "yape", "monto": total, "propina": 0},
            )
            pago_response.raise_for_status()
            if pago_response.json()["estado"] != "verificado":
                raise AssertionError("El pago digital no quedo verificado")

            suffix = uuid4().hex[:12]
            email = f"e2e.{suffix}@uttof.pe"
            upgrade_response = await client.post(
                "/auth/guest/upgrade",
                headers=auth(guest["access_token"]),
                json={
                    "nombre": "Cliente E2E",
                    "email": email,
                    "telefono": "+51987654321",
                    "password": "PruebaE2E123",
                },
            )
            upgrade_response.raise_for_status()
            registered = upgrade_response.json()
            if registered["usuario"]["es_invitado"]:
                raise AssertionError("La sesion invitada no se convirtio en cuenta")

            preferences = {"dieta": "sin_gluten", "cocinas": ["criolla", "marina"]}
            save_preferences = await client.put(
                "/usuarios/me/preferencias",
                headers=auth(registered["access_token"]),
                json=preferences,
            )
            save_preferences.raise_for_status()
            get_preferences = await client.get(
                "/usuarios/me/preferencias",
                headers=auth(registered["access_token"]),
            )
            get_preferences.raise_for_status()
            if get_preferences.json()["dieta"] != preferences["dieta"]:
                raise AssertionError("Las preferencias no se conservaron")

            reservation_time = (datetime.now(LIMA_TZ) + timedelta(days=10)).replace(
                hour=19,
                minute=0,
                second=0,
                microsecond=0,
            )
            reservation_response = await client.post(
                "/reservas",
                headers=auth(registered["access_token"]),
                json={
                    "id_mesa": id_mesa,
                    "hora_reserva": reservation_time.isoformat(),
                    "num_personas": min(2, int(mesa["capacidad"])),
                },
            )
            reservation_response.raise_for_status()
            reservation = reservation_response.json()
            id_reserva = int(reservation["id_reserva"])
            reserva_token = reservation["qr_url"].rstrip("/").split("/")[-1]

            validar_response = await client.post(
                "/reservas/validar-qr",
                headers=auth(mesero["access_token"]),
                json={"token_o_folio": reserva_token},
            )
            validar_response.raise_for_status()
            repetir_response = await client.post(
                "/reservas/validar-qr",
                headers=auth(mesero["access_token"]),
                json={"token_o_folio": reservation["folio"]},
            )
            repetir_response.raise_for_status()
            if repetir_response.json()["estado"] != "validada":
                raise AssertionError("La validacion repetida del QR no fue idempotente")

            print("E2E OK")
            print(f"mesa_qr={id_mesa}")
            print(f"pedido_cocina_pago={id_pedido}")
            print(f"invitado_convertido={id_usuario}")
            print(f"reserva_validada={id_reserva}")
        finally:
            await cleanup(id_usuario, id_pedido, id_reserva, id_mesa)
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(verify())
