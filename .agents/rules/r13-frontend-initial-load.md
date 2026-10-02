# R-13: Tratar los fallos de la carga inicial del dashboard

**Alcance:** Carga inicial de datos en `frontend/src/App.tsx`.
**Justificación:** El `useEffect` de `frontend/src/App.tsx` llama una sola vez a `fetchFinancialData` (dependencias `[]`); en el `catch` fija el mensaje de error y no reintenta. Un fallo inicial, por ejemplo un 5xx del proxy mientras el backend arranca, queda visible hasta recargar la página.

## Guía específica del proyecto

Si cambias la carga inicial, ten en cuenta que hoy un fallo no se reintenta. Cualquier reintento o recarga debe mantener coherentes los estados `loading` y `error` que reciben `KPIRow`, `IncomeOutcomeChart` y `ProfitPercentChart`.
