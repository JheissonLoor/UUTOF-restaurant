from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.auth.router import router as auth_router
from app.usuarios.router import router as usuarios_router

# Import model modules so SQLAlchemy knows every table before create_all().
from app.mesas import model as mesas_model  # noqa: F401
from app.pagos import model as pagos_model  # noqa: F401
from app.pedidos import model as pedidos_model  # noqa: F401
from app.productos import model as productos_model  # noqa: F401
from app.usuarios import model as usuarios_model  # noqa: F401
from app.seed import seed_initial_data


Base.metadata.create_all(bind=engine)
seed_initial_data()

app = FastAPI(
    title="UTTOF Restaurant API",
    description="Sistema SOA de gestion de pedidos - Restaurante UTTOF",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cada router representa un servicio SOA dentro del monolito modular.
app.include_router(auth_router)
app.include_router(usuarios_router)


@app.get("/")
def root():
    return {"mensaje": "API UTTOF funcionando"}
