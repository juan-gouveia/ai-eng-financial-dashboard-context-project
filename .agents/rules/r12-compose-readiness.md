# R-12: Considerar readiness al modificar el arranque de Compose

**Alcance:** `docker-compose.yml` y arranque del backend.
**Justificación:** En `docker-compose.yml`, el servicio `frontend` declara `depends_on: backend` sin `healthcheck`, por lo que Compose no espera a que la API responda. `backend/app/routes.py` ya expone `GET /health`.

## Guía específica del proyecto

Si cambias el orden de inicio, ten en cuenta que `depends_on` solo ordena el arranque. Si añades un `healthcheck`, usa `/health` y `depends_on: condition: service_healthy`. La imagen `python:3.13-slim` no incluye `curl`; una opción basada en Python es `python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"`.
