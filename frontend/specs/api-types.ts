// ────────────────────────────────────────────────────────────
// API Type Specifications
// Alineadas con el backend FastAPI (Financial Metrics API)
// ────────────────────────────────────────────────────────────

// ─── Literal Types ──────────────────────────────────────────

/** Tipo de operación financiera: "income" (ingreso) o "outcome" (gasto). */
export type OperationType = 'income' | 'outcome'
/** Categoría de movimiento financiero.
 *  - "suppliers": proveedores
 *  - "sales": ventas
 *  - "operational": gastos operativos
 *  - "administrative": gastos administrativos
 *  - "others": otros */
export type Category =
  | 'suppliers'
  | 'sales'
  | 'operational'
  | 'administrative'
  | 'others'
/** Tipo de negocio: "B2B" (business‑to‑business) o "B2C" (business‑to‑consumer). */
export type BusinessType = 'B2B' | 'B2C'
/** Agrupación temporal para las métricas: "day" (día), "week" (semana ISO) o "month" (mes). */
export type GroupBy = 'day' | 'week' | 'month'

// ─── GET /api/metrics/facets ────────────────────────────────
// Sin parámetros de query.
//
// Devuelve los filtros disponibles (facets): tipos de operación,
// tipos de negocio, categorías y el rango de fechas del dataset.
//
// Uso en Funcionalidad 1 — Filtro de rango de fechas:
//   - min_date / max_date se usan para mostrar al usuario el
//     rango válido y restringir la selección en los inputs.
//   - operation_types, business_types y categories alimentan
//     los selectores de filtro de la UI.

export interface FacetsResponse {
  /** Tipos de operación disponibles para filtrar.
   *  Valores: "income" (ingreso), "outcome" (gasto). */
  operation_types: OperationType[]
  /** Tipos de negocio disponibles para filtrar.
   *  Valores: "B2B" (business‑to‑business), "B2C" (business‑to‑consumer). */
  business_types: BusinessType[]
  /** Categorías de movimiento disponibles para filtrar.
   *  Valores: "suppliers", "sales", "operational", "administrative", "others". */
  categories: Category[]
  /** Fecha más antigua del dataset (YYYY-MM-DD).
   *  Se usa en la UI para mostrar el rango válido y restringir
   *  la selección en los inputs de fecha. */
  min_date: string
  /** Fecha más reciente del dataset (YYYY-MM-DD).
   *  Se usa en la UI para mostrar el rango válido y restringir
   *  la selección en los inputs de fecha. */
  max_date: string
}

// ─── GET /api/metrics/alerts ──────────────────────────────
// Detecta períodos atípicos donde el gasto (outcome) supera
// el promedio histórico en una proporción mayor al umbral.
//
// Uso en Funcionalidad 2 — Tabla de alertas de anomalías:
//   - El usuario configura threshold via input numérico (0.01‑1.0).
//   - Los parámetros opcionales start_date / end_date se
//     sincronizan con el filtro de fechas de Funcionalidad 1.
//   - Si el array respuesta está vacío, la UI debe mostrar un
//     mensaje explícito de estado vacío.

export interface AlertsRequestParams {
  /** Ratio mínimo de incremento sobre el promedio histórico (0.01‑1.0, default 0.3). */
  threshold?: number
  /** Agrupación temporal: "day", "week" o "month" (default "month"). */
  group_by?: GroupBy
  /** Filtro de fecha de inicio (inclusive). Formato: YYYY-MM-DD. */
  start_date?: string
  /** Filtro de fecha de fin (inclusive). Formato: YYYY-MM-DD. */
  end_date?: string
  /** Filtrar por tipo de negocio: "B2B" o "B2C". Cuando es undefined
   *  se incluyen ambos tipos. */
  business_type?: BusinessType
}

/** Representa un período identificado como anomalía por la API.
 *  Se genera comparando el total de gastos del período actual
 *  contra el promedio histórico (baseline_average).
 *  Si increase_ratio >= threshold, el período se devuelve como alerta. */
export interface AlertEntry {
  /** Período donde se disparó la alerta.
   *  Formato según el parámetro group_by:
   *  - "day":   "YYYY-MM-DD"     (ej. "2024-06-15")
   *  - "week":  "YYYY-Www"       (ej. "2024-W03")
   *  - "month": "YYYY-MM"        (ej. "2024-01") */
  period: string
  /** Suma total de gastos (outcome) acumulada en el período
   *  que disparó la alerta. */
  outcome_total: number
  /** Promedio histórico de gastos calculado desde el inicio
   *  del dataset hasta el período anterior al alertado.
   *  Sirve como referencia para medir la anomalía. */
  baseline_average: number
  /** Proporción de incremento:
   *  (outcome_total - baseline_average) / baseline_average.
   *  Un valor > 1 indica que el gasto duplicó el promedio histórico. */
  increase_ratio: number
}

/** Respuesta de GET /api/metrics/alerts — array de alertas.
 *  Si está vacío, la UI debe mostrar un mensaje de estado vacío. */
export type AlertsResponse = AlertEntry[]

// ─── GET /api/metrics/categories/top ─────────────────────
// Devuelve las categorías con mayor volumen para un tipo de
// operación, ordenadas de mayor a menor monto total.
//
// Uso en Funcionalidad 3 — Vista comparativa B2B vs B2C:
//   - Se invoca dos veces con business_type=B2B y B2C para
//     obtener las top categorías de ingresos por línea de negocio.
//   - start_date / end_date sincronizados con el filtro de fechas.
//   - El percentage sobre el total del grupo se calcula en cliente.

export interface TopCategoriesRequestParams {
  /** Tipo de operación a filtrar: "income" (ingreso) o "outcome" (gasto).
   *  Default en backend: "outcome". */
  operation_type?: OperationType
  /** Máximo de categorías a devolver (1‑20, default 5).
   *  La API ordena por total_amount descendente. */
  limit?: number
  /** Filtro de fecha de inicio (inclusive). Formato: YYYY-MM-DD. */
  start_date?: string
  /** Filtro de fecha de fin (inclusive). Formato: YYYY-MM-DD. */
  end_date?: string
  /** Filtrar por tipo de negocio: "B2B" o "B2C". Cuando es undefined
   *  se incluyen ambos tipos. */
  business_type?: BusinessType
}

/** Ítem devuelto por el backend en /api/metrics/categories/top */
export interface TopCategoryItem {
  /** Categoría del movimiento: "suppliers", "sales", "operational",
   *  "administrative" o "others". */
  category: Category
  /** Tipo de operación: "income" (ingreso) o "outcome" (gasto). */
  operation_type: OperationType
  /** Suma total acumulada en la categoría para el tipo de operación
   *  y filtros aplicados. */
  total_amount: number
}

/** Respuesta raw de GET /api/metrics/categories/top */
export type TopCategoriesResponse = TopCategoryItem[]

/** Ítem de la tabla de categorías en la UI.
 *  El campo percentage se calcula en cliente como
 *  (total_amount / sum_of_all_categories_in_group) * 100 */
export interface CategoryEntry {
  /** Categoría del movimiento: "suppliers", "sales", "operational",
   *  "administrative" o "others". */
  category: Category
  /** Total de ingresos para esta categoría */
  total_amount: number
  /** Porcentaje sobre el total del grupo (calculado en cliente).
   *  Rango: 0‑100. Se redondea a 2 decimales. */
  percentage: number
}