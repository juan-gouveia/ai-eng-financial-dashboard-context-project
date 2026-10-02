# R-20: Derivar periodos visibles de los datos

**Alcance:** Etiquetas de periodo en `frontend/src/App.tsx` y `frontend/src/components/dashboard/dashboard-header.tsx`.
**Justificación:** `frontend/src/App.tsx` pasa `period="2024 - Full Year"` a `DashboardHeader`, y `dashboard-header.tsx` define además su propio valor por defecto `'2024 — Full Year'`. En `backend/app/routes.py`, `_year_for_month` calcula el año de cada movimiento a partir de `date.today()`.
**Estado actual:** `App.tsx` y `dashboard-header.tsx` no cumplen esta regla. Corrígelos solo si la tarea lo pide; en otro caso, pregunta antes de cambiarlos.

## Guía específica del proyecto

Deriva las etiquetas de periodo de las fechas de los movimientos o de `/api/metrics/facets` (por ejemplo, fechas mínima y máxima) en vez de codificar un año. Al corregirlo, sustituye los dos valores fijos: la prop en `App.tsx` y el valor por defecto de `DashboardHeader`.
