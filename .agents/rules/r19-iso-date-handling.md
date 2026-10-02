# R-19: Evitar desfases al manejar fechas ISO

**Alcance:** Parseo, agrupación y presentación de fechas `YYYY-MM-DD` en `frontend/src/`.
**Justificación:** `computeMonthlyData` en `frontend/src/lib/financial-utils.ts` hace `new Date(m.create_date)` y `toYearMonthKey` lee `getFullYear()` y `getMonth()`. Las cadenas ISO de solo fecha se interpretan en UTC, así que en zonas horarias al oeste de UTC (por ejemplo, `America/Caracas`) `2025-03-01` se agrupa en febrero.
**Estado actual:** `computeMonthlyData` no cumple esta regla. Corrígela solo si la tarea lo pide; en otro caso, pregunta antes de cambiarla.

## Guía específica del proyecto

No uses `new Date(isoDate)` para agrupar fechas `YYYY-MM-DD` por día o mes. Extrae las partes del texto ISO o construye una fecha local con `new Date(year, month - 1, day)`.

Al modificar `computeMonthlyData`, añade una prueba con un movimiento fechado el día 1 y fija una zona horaria al oeste de UTC dentro del archivo de prueba, antes de crear fechas: `process.env.TZ = "America/Caracas"`. Sin esa línea la prueba pasa en UTC o al este aunque el error exista. Pasar `TZ=` por línea de comandos no tiene efecto en Git Bash de Windows. Como el cambio afecta a todo el archivo, ponlo en un archivo de prueba propio.
