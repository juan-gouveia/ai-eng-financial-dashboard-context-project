# R-02: Separar presentación y cálculos

**Alcance:** Nuevos componentes y lógica de presentación o cálculo en `frontend/src/`.
**Justificación:** `frontend/src/components/dashboard/` contiene los componentes propios del dashboard (`kpi-row.tsx`, `kpi-card.tsx`, los gráficos y la cabecera) y `frontend/src/components/ui/` las piezas genéricas (`card.tsx`, `skeleton.tsx`). `computeKPIs`, `computeMonthlyData`, `formatCurrency` y `formatPercent` en `frontend/src/lib/financial-utils.ts` son funciones puras que `App.tsx` y los componentes solo invocan.

## Guía específica del proyecto

Ubica componentes específicos del dashboard en `frontend/src/components/dashboard/` y piezas UI genéricas en `frontend/src/components/ui/`. Mantén cálculos y formateadores reutilizables en `frontend/src/lib/financial-utils.ts`, fuera del render de React.
