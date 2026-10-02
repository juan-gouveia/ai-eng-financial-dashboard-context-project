# R-21: Mantener explícita la semántica de los datos simulados

**Alcance:** `generate_mock_movements`, `_year_for_month` y cualquier vista o prueba que dependa de sus fechas y valores.
**Justificación:** En `backend/app/routes.py`, `generate_mock_movements` genera 30 movimientos por mes para los 12 meses (360) y `_year_for_month` asigna el año actual a los meses anteriores al actual y el año anterior al resto. `test_generate_mock_movements_returns_full_year_sorted_data` en `backend/tests/test_routes.py` solo comprueba la cantidad y el orden, no los años.

## Guía específica del proyecto

No describas el conjunto como un intervalo móvil exacto de 12 meses: el mes en curso nunca aparece con el año actual. Si cambias la semilla, la cantidad de movimientos o la asignación de años, actualiza `backend/tests/test_routes.py`. Para cubrir la asignación de años, prueba `_year_for_month` directamente pasando una fecha `today` fija, en lugar de depender de la fecha real.
