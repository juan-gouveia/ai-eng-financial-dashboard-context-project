# R-15: Limitar CORS fuera del entorno local

**Alcance:** Política CORS en `backend/app/main.py` y configuración de frontend que consuma la API desde otro origen.
**Justificación:** `backend/app/main.py` configura `CORSMiddleware` con `allow_origins=["*"]`, `allow_credentials=True` y métodos y cabeceras `*`.

## Guía específica del proyecto

Antes de exponer el backend fuera del entorno local, sustituye `allow_origins=["*"]` por orígenes autorizados explícitos y revisa `allow_credentials`. Si se mantiene el flujo de `r11-local-development.md` (Vite fuera de Compose con `VITE_API_BASE_URL`), incluye `http://localhost:5173` entre los orígenes permitidos. El flujo con el proxy de Vite no depende de CORS, porque las peticiones salen del mismo origen.
