# R-08: Probar las integraciones afectadas

**Alcance:** Cambios que afecten carga inicial, proxy Vite, configuración de ejecución o comunicación frontend-backend.
**Justificación:** `frontend/src/App.tsx` hace `fetch` a `${API_BASE_URL}/api/metrics` y `frontend/vite.config.ts` redirige `/api` a `http://backend:8000`. Ninguna prueba recorre ese camino: Vitest solo prueba `financial-utils.ts` y `TestClient` llama a la API sin pasar por Vite.

## Guía específica del proyecto

Cuando el cambio toque ese recorrido, con Docker Compose en ejecución:

1. Comprobación automatizable: `curl -sf http://localhost:5173/api/metrics` debe terminar sin error y devolver un array JSON.
2. Comprobación visual: abre `http://localhost:5173` y confirma que el dashboard muestra los KPIs sin el mensaje de error.

Si no puedes hacer alguna de las dos (por ejemplo, sin Docker o sin navegador), indícalo explícitamente; no la des por superada. Las pruebas unitarias de utilidades y las de rutas backend no sustituyen esta comprobación.
