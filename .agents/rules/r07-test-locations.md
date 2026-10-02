# R-07: Añadir pruebas en las ubicaciones existentes

**Alcance:** Cambios funcionales en frontend y backend.
**Justificación:** La única prueba frontend es `frontend/src/lib/financial-utils.test.ts`, con Vitest (script `test` de `frontend/package.json`). Las pruebas backend están en `backend/tests/test_routes.py` y usan `TestClient`. `frontend/package.json` no incluye `jsdom` ni Testing Library.

## Guía específica del proyecto

Prueba cálculos frontend con Vitest junto a las utilidades; prueba endpoints backend con pytest y `TestClient` en `backend/tests/`. El frontend no incluye herramientas de pruebas de componentes React; añadirlas requiere dependencias nuevas y revisión según `r16-frontend-dependencies.md`.
