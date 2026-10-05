# API Reference — Financial Metrics API

> Documentación de los endpoints del backend FastAPI.
> Base URL: `http://localhost:8000`

---

## Endpoints Documentados

- [`GET /api/metrics/facets`](#get-apimetricsfacets)
- [`GET /api/metrics/alerts?threshold=<ratio>`](#get-apimetricalertsthresholdratio)
- [`GET /api/metrics/categories/top?operation_type=income&limit=5`](#get-apimetricscategoriestopoperation_typeincomelimit5)

---

## `GET /api/metrics/facets`

Devuelve los **filtros disponibles** (facets) para acotar las consultas de métricas: tipos de operación, tipos de negocio, categorías y rango de fechas del dataset.

**Interfaz TypeSpec:** [`FacetsResponse`](../frontend/specs/api-types.ts)

### Parámetros de Query

Ninguno.

### Respuesta (200 OK)

**Schema: `MetricsFacets`**

| Campo | Tipo | Descripción |
|---|---|---|
| `operation_types` | `OperationType[]` | Valores posibles: `"income"`, `"outcome"` |
| `business_types` | `BusinessType[]` | Valores posibles: `"B2B"`, `"B2C"` |
| `categories` | `Category[]` | Valores: `"suppliers"`, `"sales"`, `"operational"`, `"administrative"`, `"others"` |
| `min_date` | `string (date)` | Fecha más antigua del dataset (`YYYY-MM-DD`). Se usa en la UI para mostrar el rango disponible. |
| `max_date` | `string (date)` | Fecha más reciente del dataset (`YYYY-MM-DD`). Se usa en la UI para mostrar el rango disponible. |

### Ejemplo de Respuesta

```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["administrative", "operational", "others", "sales", "suppliers"],
  "min_date": "2025-10-02",
  "max_date": "2026-09-28"
}
```

---

## `GET /api/metrics/alerts?threshold=<ratio>`

Detecta **períodos atípicos** donde el gasto (`outcome`) supera el promedio histórico en una proporción mayor al umbral indicado.

### Parámetros de Query

| Parámetro | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|
| `threshold` | `number` | ❌ | `0.3` | Ratio mínimo de incremento sobre el promedio histórico para generar alerta. Ej: `0.5` → 50% por encima del promedio. Mínimo: `0`. |
| `group_by` | `string` | ❌ | `"month"` | Agrupación temporal: `"day"`, `"week"` o `"month"`. |
| `start_date` | `string (date)` | ❌ | `null` | Filtro inicio (`YYYY-MM-DD`). |
| `end_date` | `string (date)` | ❌ | `null` | Filtro fin (`YYYY-MM-DD`). |
| `business_type` | `string` | ❌ | `null` | Filtrar por tipo de negocio: `"B2B"` o `"B2C"`. |

**Interfaz TypeSpec:** [`AlertsRequestParams`, `AlertEntry`, `AlertsResponse`](../frontend/specs/api-types.ts)

### Respuesta (200 OK)

**Schema: `MetricsAlert[]`** — Array de alertas.

| Campo | Tipo | Descripción |
|---|---|---|
| `period` | `string` | Período donde se disparó la alerta (formato según `group_by`: `"YYYY-MM"`, `"YYYY-WW"` o `"YYYY-MM-DD"`). |
| `outcome_total` | `number` | Gasto total del período. |
| `baseline_average` | `number` | Promedio histórico de gastos acumulado hasta el período anterior. |
| `increase_ratio` | `number` | Proporción de incremento respecto al promedio: `(outcome_total - baseline_average) / baseline_average`. |

### Ejemplo de Respuesta

```
GET /api/metrics/alerts?threshold=0.3
```

```json
[
  {
    "period": "2025-12",
    "outcome_total": 103378.98,
    "baseline_average": 51174.10,
    "increase_ratio": 1.0201
  },
  {
    "period": "2026-03",
    "outcome_total": 88076.90,
    "baseline_average": 56456.19,
    "increase_ratio": 0.5601
  }
]
```

### Lógica de Negocio

1. Se obtiene el resumen de métricas (`summarize_movements`) agrupado por el `group_by` indicado.
2. Para cada período, se calcula el promedio de gastos de **todos los períodos anteriores**.
3. Si `(outcome_actual - baseline) / baseline > threshold`, se genera una alerta.
4. Las alertas se devuelven ordenadas cronológicamente.

---

## `GET /api/metrics/categories/top?operation_type=income&limit=5`

Devuelve las **categorías con mayor volumen** para un tipo de operación específico, ordenadas de mayor a menor monto total.

**Interfaz TypeSpec:** [`TopCategoriesRequestParams`, `TopCategoryItem`, `TopCategoriesResponse`, `CategoryEntry`](../frontend/specs/api-types.ts)

### Parámetros de Query

| Parámetro | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|
| `operation_type` | `string` | ❌ | `"outcome"` | Tipo de operación: `"income"` o `"outcome"`. |
| `limit` | `integer` | ❌ | `5` | Máximo de categorías a devolver. Rango: `1`–`20`. |
| `start_date` | `string (date)` | ❌ | `null` | Filtro inicio (`YYYY-MM-DD`). |
| `end_date` | `string (date)` | ❌ | `null` | Filtro fin (`YYYY-MM-DD`). |
| `business_type` | `string` | ❌ | `null` | Filtrar por tipo de negocio: `"B2B"` o `"B2C"`. |

### Respuesta (200 OK)

**Schema: `TopCategoryItem[]`** — Array de categorías top.

| Campo | Tipo | Descripción |
|---|---|---|
| `category` | `Category` | `"suppliers"`, `"sales"`, `"operational"`, `"administrative"`, `"others"`. |
| `operation_type` | `OperationType` | `"income"` o `"outcome"`. |
| `total_amount` | `number` | Suma total acumulada en la categoría. |

> **Nota:** El campo `percentage` (porcentaje sobre el total del grupo) no lo devuelve el backend; se calcula en el cliente a partir de los `total_amount` de cada grupo.

### Ejemplo de Respuesta

```
GET /api/metrics/categories/top?operation_type=income&limit=5
```

```json
[
  {
    "category": "sales",
    "operation_type": "income",
    "total_amount": 1132097.38
  },
  {
    "category": "others",
    "operation_type": "income",
    "total_amount": 126049.49
  }
]
```

### Lógica de Negocio

1. Se filtran los movimientos por `operation_type` (y opcionalmente por fechas y `business_type`).
2. Se agrupan por categoría sumando los montos.
3. Se ordenan de mayor a menor monto total.
4. Se devuelven las primeras `limit` categorías.

---

## Schemas Compartidos

| Schema | Propiedades |
|---|---|
| **`FinancialMovement`** | `create_date: date`, `amount: float`, `operation_type: "income"\|"outcome"`, `category: Category`, `business_type: "B2B"\|"B2C"` |
| **`MetricsSummaryItem`** | `period: string`, `income: float`, `outcome: float`, `net: float` (income - outcome) |
| **`MetricsComparison`** | `current_period: float`, `previous_period: float`, `delta_abs: float`, `delta_pct: float\|null` |

> **Category** `= "suppliers" | "sales" | "operational" | "administrative" | "others"`  
> **OperationType** `= "income" | "outcome"`  
> **BusinessType** `= "B2B" | "B2C"`  
> **GroupBy** `= "day" | "week" | "month"`

---

## Consideraciones

- Todos los endpoints generan datos mock con `seed=42`, por lo que los valores son **deterministas** (mismos datos en cada llamada).
- Los endpoints que aceptan filtros de fecha (`start_date`, `end_date`) usan el formato `YYYY-MM-DD`.
- Los errores de validación (422) siguen el schema `HTTPValidationError` de FastAPI.
- El dataset mock abarca **12 meses** de movimientos financieros simulados.