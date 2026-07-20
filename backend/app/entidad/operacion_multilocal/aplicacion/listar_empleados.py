from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.operacion_multilocal.infraestructura import repo
from app.entidad.operacion_multilocal.infraestructura.schemas import EmpleadoMultilocal


async def listar_empleados(session: AsyncSession, *, id_sucursal: int | None) -> list[EmpleadoMultilocal]:
    rows = await repo.listar_empleados(session, id_sucursal=id_sucursal)
    return [EmpleadoMultilocal(**row) for row in rows]
