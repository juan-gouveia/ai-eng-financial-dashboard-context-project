# R-14: No usar el arranque de desarrollo en producción

**Alcance:** Despliegues o cambios de `backend/Dockerfile` y `docker-compose.yml`.
**Justificación:** El `CMD` de `backend/Dockerfile` es `python -m debugpy --listen 0.0.0.0:5678 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`, y `docker-compose.yml` publica el puerto `5678` y monta `./backend` como volumen.

## Guía específica del proyecto

No reutilices el `CMD` de desarrollo de `backend/Dockerfile` como configuración de producción ni expongas el puerto `5678` de `debugpy` fuera del entorno local. Trata cualquier despliegue como una configuración aparte y explícita.
