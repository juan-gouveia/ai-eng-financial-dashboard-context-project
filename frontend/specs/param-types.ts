// ────────────────────────────────────────────────────────────
// Query-parameter types
// ────────────────────────────────────────────────────────────

/** Filtro opcional de rango de fechas, usado transversalmente
 *  por varios endpoints de la API.
 *
 *  Ambos campos son opcionales; cuando están vacíos / undefined
 *  la API devuelve datos sin filtrar por fecha.
 *
 *  Formato: YYYY-MM-DD (ISO‑8601 date, ej: "2025-10-02").
 *  El backend rechaza formatos inválidos con error 422. */
export interface DateRangeFilter {
  /** Fecha de inicio del filtro (inclusive).
   *  Formato: YYYY-MM-DD (ISO‑8601). Ej: "2025-10-02".
   *  Cuando es undefined la API no filtra por fecha de inicio. */
  start_date?: string
  /** Fecha de fin del filtro (inclusive).
   *  Formato: YYYY-MM-DD (ISO‑8601). Ej: "2026-09-28".
   *  Cuando es undefined la API no filtra por fecha de fin. */
  end_date?: string
}

/** Parámetros para GET /api/metrics/alerts.
 *  Combina el umbral de alerta con el filtro de fechas opcional.
 *  threshold por defecto es 0.3 en el backend. */
export interface AlertsParams extends DateRangeFilter {
  /** Ratio mínimo de incremento sobre el promedio histórico.
   *  Rango: 0.01 a 1.0. Default en backend: 0.3.
   *  Ej: 0.5 significa «50 % por encima del promedio histórico».
   *  Si el incremento de (outcome_total - baseline) / baseline
   *  supera este valor, se genera una alerta. */
  threshold?: number
}

/** Parámetros para GET /api/metrics/categories/top.
 *  Tipo de operación, límite de resultados y filtro de fechas opcional.
 *  operation_type por defecto es "outcome", limit por defecto es 5. */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Tipo de operación a filtrar: "income" (ingreso) o "outcome" (gasto).
   *  Default en backend: "outcome". Obligatorio definir para la
   *  Funcionalidad 3, donde siempre se usa "income". */
  operation_type?: 'income' | 'outcome'
  /** Máximo de categorías a devolver.
   *  Rango válido: 1‑20. Default en backend: 5.
   *  La API ordena por total_amount descendente y trunca
   *  las primeras N categorías. */
  limit?: number
}