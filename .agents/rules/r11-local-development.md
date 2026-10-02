# R-11: Usar el entorno compatible con la configuración local

**Alcance:** Desarrollo local del frontend y conexión con backend.
**Justificación:** `frontend/vite.config.ts` redirige `/api` a `http://backend:8000`, el nombre del servicio en `docker-compose.yml`, que solo resuelve dentro de la red de Compose. `frontend/src/App.tsx` antepone `VITE_API_BASE_URL ?? ""` a las peticiones.

## Guía específica del proyecto

Usa Docker Compose para el flujo local predeterminado. Si ejecutas Vite fuera de Compose, define `VITE_API_BASE_URL` con un origen accesible, normalmente `http://localhost:8000`. Esta alternativa depende de la política CORS del backend; ver `r15-cors-policy.md`.
