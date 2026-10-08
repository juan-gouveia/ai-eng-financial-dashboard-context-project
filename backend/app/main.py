import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import router

# R-15: wildcard no apto para producción. Despliegue:
#   ALLOWED_ORIGINS="https://tu-dominio.com" (separados por coma si hay varios)
# Local (dev) mantiene "*" por defecto para no romper el flujo existente.
_default_origins = "*"
_allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

app = FastAPI(title="Financial Metrics API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
