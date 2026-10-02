# R-01: Mantener sincronizado el contrato API

**Alcance:** Cambios en endpoints, modelos de respuesta, filtros, enums o consumo de API en `backend/app/routes.py` y `frontend/src/`.
**Justificación:** `backend/app/routes.py` define los modelos Pydantic (`FinancialMovement`, `MetricsSummaryItem`, etc.) y los `Literal` `Category`, `OperationType` y `BusinessType`; `frontend/src/lib/financial-types.ts` repite a mano esos tipos como interfaces y union types de TypeScript. No hay generación ni paquete compartido entre ambos. `create_date` es `date` en Pydantic y `string` en TypeScript; coinciden porque FastAPI lo serializa como `YYYY-MM-DD`.

## Guía específica del proyecto

Al cambiar un campo o añadir consumo de un endpoint, actualiza los modelos Pydantic en `backend/app/routes.py`, los tipos en `frontend/src/lib/financial-types.ts` y las pruebas pertinentes en `backend/tests/test_routes.py` y `frontend/src/lib/financial-utils.test.ts`. Si cambian los valores de `Category`, `OperationType` o `BusinessType`, actualiza también los union types equivalentes. Conserva el formato ISO `YYYY-MM-DD` de `create_date`.
