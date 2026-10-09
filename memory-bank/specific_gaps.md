# Gaps específicos del repo (heredado)

Snapshot documental: 2026-10-09. Identificados a partir del análisis cruzado de `README.md`, `API_Reference.md`, `AUDITORIA.md` y `progress.md` dentro de `memory-bank/`, y verificados contra el código fuente actual. Estos gaps son distintos de los ya registrados en "Gaps conocidos" de `README.md` y de los hallazgos D1–D12 de `AUDITORIA.md`; no se repiten aquí.

---

## Gap 1 — Cobertura asimétrica de documentación/contrato de API

**Qué se observa:** El backend expone 8 rutas bajo `/api/metrics` (`routes.py`): movimientos base, `facets`, `summary`, `categories/top`, `comparison`, `alerts`, `b2b` y `b2c`. De esas 8, **`API_Reference.md` solo documenta 3** (`facets`, `alerts`, `categories/top`), y **`frontend/specs/api-types.ts` solo define TypeSpec para esas mismas 3** (`FacetsResponse`, `AlertsRequestParams`/`AlertEntry`/`AlertsResponse`, `TopCategoriesRequestParams`/`TopCategoryItem`/`TopCategoriesResponse`/`CategoryEntry`).

Las otras 5 rutas (`/api/metrics` base, `/summary`, `/comparison`, `/b2b`, `/b2c`) tienen modelos Pydantic en `routes.py` (`FinancialMovement`, `MetricsSummaryItem`, `MetricsComparison`) pero **ningún TypeSpec equivalente ni entrada en `API_Reference.md`**. El tipo `FinancialMovement` que sí usa el frontend vive aparte, en `frontend/src/lib/financial-types.ts`, copiado a mano y desconectado de `specs/api-types.ts`.

**Por qué es relevante:** La regla `.agents/rules/r01-api-contract-sync.md` exige sincronizar los modelos Pydantic con los tipos TypeScript al cambiar o consumir un endpoint, pero esa guía no tiene ningún punto de anclaje para los 5 endpoints sin TypeSpec — un agente o desarrollador que conecte `/comparison`, `/summary`, `/b2b` o `/b2c` al frontend no tiene contrato de referencia que seguir ni actualizar, y `API_Reference.md` quedaría igualmente incompleto. `AUDITORIA.md` (línea ~504) señala en términos generales que `frontend/specs/` "duplica tipos y puede desactualizarse", pero no identifica que el 62% de la superficie de la API (5 de 8 rutas) carece de cualquier contrato o documentación desde el día uno.

**Dónde:** [routes.py](../backend/app/routes.py) · [API_Reference.md](API_Reference.md) · [api-types.ts](../frontend/specs/api-types.ts) · [financial-types.ts](../frontend/src/lib/financial-types.ts) · [r01-api-contract-sync.md](../.agents/rules/r01-api-contract-sync.md)

**Implicación práctica:** Antes de conectar cualquiera de esos 5 endpoints al dashboard, hay que crear su TypeSpec en `api-types.ts` y su entrada en `API_Reference.md` desde cero — no es un simple "actualizar lo existente".

---

## Gap 2 — Formato de moneda fijo (USD/en-US, sin decimales) no documentado como decisión de producto

**Qué se observa:** `formatCurrency` en [financial-utils.ts](../frontend/src/lib/financial-utils.ts) usa:

```ts
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
```

Esto hace dos cosas silenciosamente: (a) **redondea todo monto a dólares enteros** (p. ej. `103378.98` → `"$103,379"`, perdiendo los centavos que el backend sí entrega con precisión decimal — ver ejemplos en `API_Reference.md`), y (b) **fija locale y moneda a `en-US`/`USD`** sin relación con `business_type` (`B2B`/`B2C`) ni con ningún parámetro de configuración. Es la única función de formateo numérico en el frontend y se usa en los 3 KPI cards, en `income-outcome-chart.tsx` (tooltips y tabla oculta) y en cualquier componente futuro que muestre montos.

**Por qué es relevante:** Es un dashboard *financiero*; redondear a entero oculta diferencias de hasta ~$0.99 por movimiento y, agregado sobre cientos de movimientos simulados, puede desviar visualmente los KPIs frente a los valores exactos que expone la API. Ninguno de los documentos de `memory-bank/` (ni `README.md`, ni `AUDITORIA.md` D1–D12, ni `progress.md`) registra esto como una decisión consciente de producto — solo existe el hallazgo D12 de `AUDITORIA.md`, que es un gap de **rendimiento** (cachear la instancia de `Intl.NumberFormat`), no de **semántica/precisión** del formato. El repo tampoco tiene ninguna regla en `.agents/rules/` sobre convenciones de formateo numérico o monetario (sí hay reglas para fechas: `r19-iso-date-handling.md`, `r20-data-driven-period-labels.md`).

**Dónde:** [financial-utils.ts:72-81](../frontend/src/lib/financial-utils.ts) · [kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx) · [income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx) · [financial-utils.test.ts:107-108](../frontend/src/lib/financial-utils.test.ts) (el test `formats currency without decimals` fija el comportamiento actual, pero no explica si es intencional)

**Implicación práctica:** Antes de cambiar o extender `formatCurrency` (p. ej. al conectar `/comparison` o `/summary`, Gap 1), confirmar con el equipo si el redondeo a entero y el locale fijo son intencionales; si no lo son, es un defecto de precisión silencioso, no solo de rendimiento.

---

## Metodología

Ambos gaps se verificaron directamente contra el código (no se infirieron solo de la documentación):
- Gap 1: se listaron los decoradores `@router.get` en `routes.py` (9 rutas incl. `/health`) y se comparó contra las secciones de `API_Reference.md` y los `export interface`/`export type` de `api-types.ts`.
- Gap 2: se leyó la implementación de `formatCurrency` y se confirmó su uso exclusivo en los 3 puntos de consumo del dashboard (`kpi-row.tsx`, `income-outcome-chart.tsx`).

Se descartó como gap `frontend/src/lib/mock-data.ts` (código muerto, 360 movimientos hardcodeados en 2024) porque ya está documentado y cerrado como D3 en `AUDITORIA.md`.
