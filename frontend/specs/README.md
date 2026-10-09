# TypeSpecs del Frontend — Dashboard Financiero

> Este directorio contiene la especificación tipada de las 3 funcionalidades
> del dashboard, alineada con el backend FastAPI (`backend/app/routes.py`).
>
> Archivos:
> - `api-types.ts` → Interfaces de respuesta de la API y entidades de dominio
> - `param-types.ts` → Interfaces de parámetros de query (heredan de `DateRangeFilter`)
> - `components.ts` → Props de componentes de UI y su correspondencia con tipos
> - `components.md` → Documentación detallada de props por componente
> - `README.md` → Este archivo: resumen por funcionalidad

---

## Funcionalidad 1 — Filtro de rango de fechas

### Endpoint

```
GET /api/metrics/facets
```

**Sin parámetros de query.**

Devuelve los valores discretos disponibles para los filtros del dashboard y el
rango de fechas completo del dataset.

### Parámetros

Ninguno.

### Respuesta — `FacetsResponse`

```ts
// api-types.ts
interface FacetsResponse {
  operation_types: OperationType[]   // ["income", "outcome"]
  business_types: BusinessType[]     // ["B2B", "B2C"]
  categories: Category[]             // ["suppliers","sales","operational","administrative","others"]
  min_date: string                   // YYYY-MM-DD, ej: "2024-01-05"
  max_date: string                   // YYYY-MM-DD, ej: "2024-12-30"
}
```

| Campo | Tipo | Valores / Formato |
|-------|------|--------------------|
| `operation_types` | `OperationType[]` | `"income"` (ingreso), `"outcome"` (gasto). Orden alfabético. |
| `business_types` | `BusinessType[]` | `"B2B"`, `"B2C"`. Orden alfabético. |
| `categories` | `Category[]` | `"suppliers"`, `"sales"`, `"operational"`, `"administrative"`, `"others"`. Orden alfabético. |
| `min_date` | `string` (date) | ISO-8601: `YYYY-MM-DD`. Fecha del movimiento más antiguo del dataset. |
| `max_date` | `string` (date) | ISO-8601: `YYYY-MM-DD`. Fecha del movimiento más reciente del dataset. |

### Comportamiento del backend

```python
# routes.py
@router.get("/api/metrics/facets", response_model=MetricsFacets)
def get_metrics_facets() -> MetricsFacets:
    movements = generate_mock_movements(seed=42)
    return build_metrics_facets(movements)
```

- Genera 360 movimientos mock (30 por cada uno de los 12 meses anteriores
  al actual) con `seed=42` y extrae los conjuntos únicos.
- `min_date` / `max_date` se obtienen ordenando cronológicamente.

### Casos límite

| # | Situación | Comportamiento esperado en UI |
|---|-----------|-------------------------------|
| 1 | **API no responde** (timeout, 5xx) | El `DateRangeFilterBar` no debe renderizar inputs de fecha. Mostrar indicador de error ("No se pudieron cargar los filtros. Reintentar.") |
| 2 | **Rango inválido**: usuario selecciona `end_date` anterior a `start_date` | El filtro debe impedir la selección (validación cruzada: `end_date >= start_date`). Si se envía igual a la API, FastAPI lo procesa sin error pero devuelve 0 resultados. |

---

## Funcionalidad 2 — Tabla de alertas de anomalías

### Endpoint

```
GET /api/metrics/alerts?threshold=0.3&group_by=month
```

### Parámetros — `AlertsParams`

```ts
// param-types.ts
interface AlertsParams extends DateRangeFilter {
  threshold?: number   // 0.01–1.0, default 0.3
}

interface DateRangeFilter {
  start_date?: string  // YYYY-MM-DD
  end_date?: string    // YYYY-MM-DD
}
```

| Parámetro | ¿Obligatorio? | Tipo | Default | Restricciones |
|-----------|:---:|------|---------|---------------|
| `threshold` | ❌ | `float` | `0.3` | `>= 0` (el backend acepta 0). Si se omite, usa 0.3. |
| `group_by` | ❌ | `string` | `"month"` | `"day"` \| `"week"` \| `"month"`. |
| `start_date` | ❌ | `string` (date) | `null` | ISO-8601 `YYYY-MM-DD`. Si se omite, no filtra por inicio. |
| `end_date` | ❌ | `string` (date) | `null` | ISO-8601 `YYYY-MM-DD`. Si se omite, no filtra por fin. |
| `business_type` | ❌ | `string` | `null` | `"B2B"` \| `"B2C"`. Si se omite, incluye ambos. |

### Respuesta — `AlertsResponse` (`AlertEntry[]`)

```ts
// api-types.ts
interface AlertEntry {
  period: string           // Según group_by
  outcome_total: number
  baseline_average: number
  increase_ratio: number
}

type AlertsResponse = AlertEntry[]
```

| Campo | Tipo | Descripción | Formato |
|-------|------|-------------|---------|
| `period` | `string` | Período en que se disparó la alerta. | Según `group_by`: `"day"` → `YYYY-MM-DD` (ej. `"2024-06-15"`), `"week"` → `YYYY-Www` (ej. `"2024-W03"`), `"month"` → `YYYY-MM` (ej. `"2024-01"`) |
| `outcome_total` | `number` | Suma total de gastos en el período. | Float con 2 decimales. Formatear con `formatCurrency()`. |
| `baseline_average` | `number` | Promedio histórico de gastos acumulado hasta el período anterior. | Float con 2 decimales. Formatear con `formatCurrency()`. |
| `increase_ratio` | `number` | Proporción de incremento sobre la línea base. | Float con 4 decimales. Fórmula: `(outcome_total − baseline_average) ÷ baseline_average`. Un valor > 1 significa que el gasto duplicó el promedio. |

> **Nota:** El primer período **nunca** genera alerta porque no hay datos
> históricos previos para calcular `baseline_average`.

### Lógica de detección (backend)

```python
# routes.py
def detect_outcome_alerts(summary, threshold):
    alerts = []
    historical_outcomes = []
    for item in summary:
        if historical_outcomes:
            baseline = sum(historical_outcomes) / len(historical_outcomes)
            if baseline > 0:
                increase_ratio = (item.outcome - baseline) / baseline
                if increase_ratio > threshold:
                    alerts.append(...)
        historical_outcomes.append(item.outcome)
    return alerts
```

- La línea base es el promedio aritmético de **todos** los períodos anteriores.
- Si `baseline` es 0, se salta ese período (división entre cero).
- La comparación es estricta: `increase_ratio > threshold` (no `>=`).

### Casos límite

| # | Situación | Comportamiento esperado en UI |
|---|-----------|-------------------------------|
| 1 | **Sin alertas**: ningún período supera el umbral o no hay datos. | Mostrar mensaje explícito: *"No se detectaron anomalías para el umbral y filtros seleccionados."*. Las columnas de la tabla deben ocultarse o mostrar un row vacío con el mensaje. |
| 2 | **`threshold` excesivamente bajo** (ej. 0.01). | Casi todos los períodos pueden disparar alertas. La tabla crece. La UI debe soportar scroll y no romper layout con listas largas. Si hay más de 50 alertas, considerar agregar un mensaje informativo o paginación virtual. |
| 3 | **`threshold = 0`** | Cada período cuyo gasto supere el promedio histórico (aunque sea por centavos) genera alerta. El backend lo permite (`ge=0`). La UI debe mostrar muchas alertas. |
| 4 | **Fechas sin datos**: el filtro de fechas no cubre ningún movimiento. | `summary` vacío → `alerts` vacío. Mostrar mensaje de estado vacío. |
| 5 | **Error de red / 5xx** | Mostrar mensaje de error: *"No se pudieron cargar las alertas. Verifica la conexión con el backend."*. No mezclar con datos de una respuesta anterior exitosa. |

---

## Funcionalidad 3 — Vista comparativa B2B vs B2C

### Endpoint

```
GET /api/metrics/categories/top?operation_type=income&limit=5
```

Se invoca **dos veces**:
1. Con `business_type=B2B` → top categorías de ingresos del segmento B2B
2. Con `business_type=B2C` → top categorías de ingresos del segmento B2C

### Parámetros — `TopCategoriesParams`

```ts
// param-types.ts
interface TopCategoriesParams extends DateRangeFilter {
  operation_type?: 'income' | 'outcome'   // default "outcome"
  limit?: number                           // 1–20, default 5
}
```

| Parámetro | ¿Obligatorio? | Tipo | Default | Restricciones |
|-----------|:---:|------|---------|---------------|
| `operation_type` | ❌ | `string` | `"outcome"` | `"income"` \| `"outcome"`. Para la Funcionalidad 3 se usa siempre `"income"`. |
| `limit` | ❌ | `integer` | `5` | `1` – `20`. La API ordena por `total_amount` descendente. |
| `start_date` | ❌ | `string` (date) | `null` | ISO-8601 `YYYY-MM-DD`. |
| `end_date` | ❌ | `string` (date) | `null` | ISO-8601 `YYYY-MM-DD`. |
| `business_type` | ❌ | `string` | `null` | `"B2B"` \| `"B2C"`. Obligatorio para la comparativa. |

### Respuesta — `TopCategoriesResponse` (`TopCategoryItem[]`)

```ts
// api-types.ts
interface TopCategoryItem {
  category: Category           // "suppliers" | "sales" | "operational" | "administrative" | "others"
  operation_type: OperationType // "income" | "outcome"
  total_amount: number
}

type TopCategoriesResponse = TopCategoryItem[]
```

| Campo | Tipo | Descripción | Valores |
|-------|------|-------------|---------|
| `category` | `Category` | Categoría del movimiento. | `"suppliers"`, `"sales"`, `"operational"`, `"administrative"`, `"others"` |
| `operation_type` | `OperationType` | Tipo de operación filtrada. | Coincide con el parámetro `operation_type` enviado. |
| `total_amount` | `number` | Suma total acumulada en la categoría. | Float con 2 decimales. Orden descendente en el array. |

### Enriquecimiento a `CategoryEntry[]`

Para mostrar la tabla comparativa, el cliente transforma cada `TopCategoryItem[]`
a `CategoryEntry[]` calculando el porcentaje sobre el subtotal del grupo:

```ts
// api-types.ts
interface CategoryEntry {
  category: Category
  total_amount: number
  percentage: number   // 0–100, redondeado a 2 decimales
}

// Cálculo en cliente:
function toCategoryEntries(items: TopCategoryItem[]): CategoryEntry[] {
  const total = items.reduce((sum, i) => sum + i.total_amount, 0)
  return items.map(item => ({
    category: item.category,
    total_amount: item.total_amount,
    percentage: total > 0
      ? Number((item.total_amount / total * 100).toFixed(2))
      : 0,
  }))
}
```

### Lógica del backend

```python
# routes.py
@router.get("/api/metrics/categories/top", response_model=list[TopCategoryItem])
def get_top_categories(
    operation_type: OperationType = Query(default="outcome"),
    limit: int = Query(default=5, ge=1, le=20),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    business_type: BusinessType | None = Query(default=None),
) -> list[TopCategoryItem]:
    movements = generate_mock_movements(seed=42)
    if business_type is not None:
        movements = [m for m in movements if m.business_type == business_type]
    filtered = filter_movements(movements, start_date, end_date,
                                category=None, operation_type=operation_type)
    return build_top_categories(filtered, operation_type, limit)
```

- Filtra por `business_type` **antes** de aplicar el filtro de fechas y
  `operation_type`.
- `build_top_categories` suma por categoría, ordena descendente y trunca
  a `limit`.

### Casos límite

| # | Situación | Comportamiento esperado en UI |
|---|-----------|-------------------------------|
| 1 | **Una de las dos tablas vacía** (B2B tiene datos, B2C no, o viceversa). | La tabla con datos se muestra normalmente. La tabla vacía muestra: *"No hay datos de [B2B/B2C] para el filtro seleccionado."*. El layout de dos columnas se mantiene (no colapsar a una). |
| 2 | **Menos categorías que `limit`** (ej. solo 2 categorías tienen movimientos del tipo solicitado). | La tabla muestra solo las que existen, sin rellenar con filas vacías. |
| 3 | **Todas las categorías con `total_amount = 0`** | `toCategoryEntries` produce `percentage = 0` para todas (división segura porque `total > 0` falla y va al分支 `0`). La tabla muestra montos en $0.00 y porcentajes en 0.00%. |
| 4 | **Fechas sin datos**: el filtro excluye todos los movimientos. | Ambas tablas vacías. Mostrar: *"No hay datos de ingresos para el rango de fechas seleccionado."*. |

---

## Mapa de archivos

```
frontend/specs/
├── README.md          ← Este archivo
├── api-types.ts       ← FacetsResponse, AlertEntry, AlertsResponse,
│                         TopCategoryItem, TopCategoriesResponse, CategoryEntry
├── param-types.ts     ← DateRangeFilter, AlertsParams, TopCategoriesParams
├── components.md      ← Props de componentes por funcionalidad (alineación UI ↔ tipos)
└── components.ts      ← Interfaces de props de componentes (TBD)
```

## Referencia rápida de rutas backend

| Ruta | Método | ¿Requiere auth? | Seed |
|------|--------|:---:|:----:|
| `GET /api/metrics/facets` | Lectura | No | `seed=42` |
| `GET /api/metrics/alerts` | Lectura | No | `seed=42` |
| `GET /api/metrics/categories/top` | Lectura | No | `seed=42` |
| `GET /api/metrics` | Lectura | No | `seed=42` |
| `GET /api/metrics/summary` | Lectura | No | `seed=42` |
| `GET /api/metrics/comparison` | Lectura | No | `seed=42` |
| `GET /api/metrics/b2b` | Lectura | No | `seed=42` |
| `GET /api/metrics/b2c` | Lectura | No | `seed=42` |
| `GET /health` | Lectura | No | — |

> Todas las llamadas generan datos mock con `random.seed(42)`, por lo que los
> valores son deterministas dentro de una misma ejecución del backend.