# R-10: Mantener sincronizados los README bilingües

**Alcance:** Cambios de arranque, configuración local, puertos o URLs.
**Justificación:** `README.md` y `README.es.md` contienen las mismas instrucciones de ejecución local (`docker compose up --build`, URLs de los puertos `5173` y `8000`, `/docs` y uso de `frontend/.env.example`). Ninguno documenta endpoints.

## Guía específica del proyecto

Actualiza `README.md` y `README.es.md` en el mismo cambio. Conserva equivalentes el comando de ejecución, las URLs y las instrucciones de `VITE_API_BASE_URL`. Esta regla no exige documentar endpoints en los README; la referencia de la API es `/docs`.
