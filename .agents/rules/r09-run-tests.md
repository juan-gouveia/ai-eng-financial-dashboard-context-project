# R-09: Ejecutar las pruebas pertinentes

**Alcance:** Todo cambio funcional en frontend o backend.
**Justificación:** `frontend/package.json` define el script `"test": "vitest run"` con Vitest como dependencia de desarrollo. `backend/requirements.txt` incluye `pytest` y `backend/Dockerfile` lo instala en la imagen, por lo que las pruebas backend se ejecutan dentro del contenedor.

## Guía específica del proyecto

- Frontend: desde `frontend/`, ejecuta `npm test`. No uses `npx vitest run`: si faltan dependencias, `npx` descarga la última versión de Vitest en lugar de la del lockfile. Si `node_modules` no existe, instálalo con `npm ci`, que no modifica `package-lock.json`.
- Backend: si los servicios están levantados, ejecuta `docker compose exec backend pytest`. No levantes ni reconstruyas servicios solo para esto sin avisar.

Indica qué pruebas no pudiste ejecutar; no presentes un resultado no verificado como exitoso.
