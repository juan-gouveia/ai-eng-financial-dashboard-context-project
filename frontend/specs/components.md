# Componentes del Dashboard — Especificación de props y tipos

> **Propósito:** Alinear las propiedades de cada componente con los tipos definidos en
> `api-types.ts` (respuestas de API) y `param-types.ts` (parámetros de query),
> organizado por funcionalidad. Los tipos base del dominio (`FinancialMovement`,
> `KPIMetrics`, `MonthlyDataPoint`) viven en `src/lib/financial-types.ts`.

---

## Funcionalidad 1 — Filtro de rango de fechas

### Estado compartido

Toda la funcionalidad 1 gira en torno a un estado de filtro que debe ser accesible
desde los componentes que consumen datos financieros.

```ts
// Estado del filtro de fechas (vivo en el App o en un store)
interface DateFilterState {
  start_date: string | undefined   // YYYY-MM-DD
  end_date: string | undefined     // YYYY-MM-DD
}
```

### Componentes que consumen el filtro

#### `DateRangeFilterBar` (nuevo)

| Prop | Tipo | Fuente del tipo | Descripción |
|------|------|-----------------|-------------|
| `startDate` | `string \| undefined` | `DateRangeFilter.start_date` (ISO-8601) | Fecha inicial seleccionada |
| `endDate` | `string \| undefined` | `DateRangeFilter.end_date` (ISO-8601) | Fecha final seleccionada |
| `minDate` | `string` | `FacetsResponse.min_date` | Límite inferior permitido (del dataset) |
| `maxDate` | `string` | `FacetsResponse.max_date` | Límite superior permitido (del dataset) |
| `onChange` | `(state: DateFilterState) => void` | — | Callback al cambiar fechas |

> **Comportamiento esperado:** El componente renderiza dos `<input type="date">`
> y sincroniza el `DateFilterState` con el `DateRangeFilter` de la API.
> Los atributos `min` / `max` se alimentan de `FacetsResponse`.

#### `FacetsLoader` (nuevo — utility opcional)

| Prop | Tipo | Descripción |
|------|------|-------------|
| `apiBaseUrl` | `string` | Base URL del backend |
| `onResult` | `(facets: FacetsResponse) => void` | Callback con facets cargados |
| `onError` | `(err: Error) => void` | Callback de error |

> Dispara `GET /api/metrics/facets` (sin parámetros) y devuelve `FacetsResponse`.
> El resultado se usa para poblar `minDate`/`maxDate` del `DateRangeFilterBar`
> y los selectores de tipo de operación / negocio / categoría en la UI.

#### `DashboardHeader` (existente — modificar)

| Prop actual | Tipo actual | Cambio propuesto |
|-------------|-------------|------------------|
| `period` | `string` | **Mantener**, pero convertirlo en derivado del `DateFilterState`. Cuando no hay filtro activo mostrar "Full Year" (comportamiento actual). Cuando hay filtro mostrar "start_date → end_date" |

> La prop `period` debe recalcularse con cada cambio de fechas.

#### `KPIRow` (existente — requiere adaptación)

| Prop actual | Tipo actual | Cambio propuesto |
|-------------|-------------|------------------|
| `metrics` | `KPIMetrics \| null` | **Igual**, pero los KPIs deben recalcularse con los movimientos filtrados por fecha |
| `loading` | `boolean` | **Igual** |

> El App deberá:
> 1. Filtrar `FinancialMovement[]` localmente por `start_date`/`end_date`
> 2. Re-ejecutar `computeKPIs()` con el subconjunto
> 3. Re-ejecutar `computeMonthlyData()` con el subconjunto

#### `IncomeOutcomeChart` (existente — requiere adaptación)

| Prop actual | Tipo actual | Cambio propuesto |
|-------------|-------------|------------------|
| `data` | `MonthlyDataPoint[]` | **Igual**, pero los datos origen deben estar filtrados por fecha |
| `loading` | `boolean` | **Igual** |

#### `ProfitPercentChart` (existente — requiere adaptación)

| Prop actual | Tipo actual | Cambio propuesto |
|-------------|-------------|------------------|
| `data` | `MonthlyDataPoint[]` | **Igual**, mismo comportamiento que `IncomeOutcomeChart` |
| `loading` | `boolean` | **Igual** |

---

## Funcionalidad 2 — Tabla de alertas de anomalías

### Nuevo componente: `AlertsTable`

> **Opción B (datos inyectados).** El App orquesta el fetch y pasa los datos ya
> resueltos. `AlertsTable` es puramente presentacional.

| Prop | Tipo | Fuente del tipo | Descripción |
|------|------|-----------------|-------------|
| `alerts` | `AlertEntry[]` | `AlertsResponse` | Datos de alertas desde la API (resueltos por el App) |
| `loading` | `boolean` | — | Indicador de carga (gestionado por el App) |
| `error` | `string \| undefined` | — | Mensaje de error si falló el fetch (gestionado por el App) |

### Columnas de la tabla

| Columna | Prop del dato | Formato |
|---------|---------------|---------|
| Período | `entry.period` | Según el `groupBy` usado en la petición:
  - `"day"`: `YYYY-MM-DD` (ej. `"2024-06-15"`)
  - `"week"`: `YYYY-Www` (ej. `"2024-W03"`)
  - `"month"`: `YYYY-MM` (ej. `"2024-01"`) |
| Gasto total | `entry.outcome_total` | Formatear con `formatCurrency()` |
| Promedio histórico | `entry.baseline_average` | Formatear con `formatCurrency()` |
| Incremento | `entry.increase_ratio` | Formatear como porcentaje, ej: `(entry.increase_ratio * 100).toFixed(1) + "%"` |

### Controles de alerta (separados de `AlertsTable`, gestionados por el App)

| Control | Tipo | Rango / Default | Descripción |
|---------|------|-----------------|-------------|
| `threshold` | `number` | `0.01` – `1.00` · default `0.30` | Input numérico (slider o caja). Al cambiar, el App dispara un nuevo fetch |
| `groupBy` | `GroupBy` | `"day" \| "week" \| "month"` · default `"month"` | Selector de agrupación. Al cambiar, el App dispara un nuevo fetch |

> Los controles `threshold` y `groupBy` viven en la UI como elementos separados
> (dentro de un `<form>` o toolbar). El App escucha sus cambios, construye los
> query params con `AlertsParams` y ejecuta el fetch. `AlertsTable` solo recibe
> el array resultante, el estado de carga y el posible error.

### Estado vacío

Cuando `alerts` es un array vacío, la UI debe mostrar un mensaje explícito:
> "No se detectaron anomalías para el umbral y filtros seleccionados."

---

## Funcionalidad 3 — Vista comparativa B2B vs B2C

### Nuevo componente: `B2BvsB2CComparison`

| Prop | Tipo | Fuente del tipo | Descripción |
|------|------|-----------------|-------------|
| `operationType` | `OperationType` | `TopCategoriesRequestParams.operation_type` (default `"income"`) | Tipo de operación a comparar |
| `limit` | `number` | `TopCategoriesRequestParams.limit` (1–20, default 5) | Máximo de categorías por tabla |
| `startDate` | `string \| undefined` | `TopCategoriesRequestParams.start_date` | Sincronizado con `DateRangeFilter` |
| `endDate` | `string \| undefined` | `TopCategoriesRequestParams.end_date` | Sincronizado con `DateRangeFilter` |
| `b2bData` | `TopCategoryItem[]` | `TopCategoriesResponse` | Top categorías para B2B |
| `b2cData` | `TopCategoryItem[]` | `TopCategoriesResponse` | Top categorías para B2C |
| `loading` | `boolean` | — | Indicador de carga |

### Datos de entrada al componente

El `App` debe:
1. Invocar `GET /api/metrics/categories/top?operation_type=income&business_type=B2B&limit=5`
   → recibe `TopCategoryItem[]`, se asigna a `b2bData`
2. Invocar `GET /api/metrics/categories/top?operation_type=income&business_type=B2C&limit=5`
   → recibe `TopCategoryItem[]`, se asigna a `b2cData`

### Columnas de cada tabla lateral (basadas en `TopCategoryItem`)

| Columna | Prop del dato | Formato |
|---------|---------------|---------|
| Categoría | `item.category` | Texto capitalizado |
| Tipo de operación | `item.operation_type` | `"income"` o `"outcome"` |
| Total | `item.total_amount` | Formatear con `formatCurrency()` |

### Porcentajes calculados en cliente (usan `CategoryEntry`)

Cada tabla lateral debe enriquecer sus `TopCategoryItem[]` a `CategoryEntry[]`
calculando el porcentaje sobre el subtotal del grupo:

```ts
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

| Columna extra | Prop del dato | Fórmula |
|---------------|---------------|---------|
| Porcentaje | `entry.percentage` | `(item.total_amount / subtotal_del_grupo) * 100`, redondeado a 2 decimales |

### Estado vacío

Cuando `b2bData` o `b2cData` están vacíos, mostrar:
> "No hay datos de [B2B/B2C] para el filtro seleccionado."

---

## Árbol de componentes propuesto (visión general)

```
App
├── DateRangeFilterBar          ← nuevo: DateFilterState + FacetsResponse
├── DashboardHeader             ← modificado: period derivado del filtro
│
├── KPIRow                      ← modificado: recalcula KPIs con datos filtrados
│   └── KPICard × 4
│
├── section[charts]
│   ├── IncomeOutcomeChart      ← modificado: datos filtrados
│   └── ProfitPercentChart      ← modificado: datos filtrados
│
├── AlertsTable                 ← nuevo: AlertsRequestParams + AlertsResponse
│
└── B2BvsB2CComparison          ← nuevo: TopCategoriesParams + TopCategoriesResponse
    ├── [Tabla B2B]             ← CategoryEntry[]
    └── [Tabla B2C]             ← CategoryEntry[]
```

---

## Decisiones de diseño adoptadas

1. **`DateRangeFilterBar`** → Componente **independiente**. El `DashboardHeader`
   recibe el `DateFilterState` como prop y deriva su badge de período desde ahí.
   Esto mantiene la separación de responsabilidades: el filtro gestiona la entrada
   de usuario, el header solo presenta.

2. **`AlertsTable`** → **Opción B — datos inyectados.** El App orquesta el fetch y pasa `alerts: AlertEntry[]` ya resueltos. `AlertsTable` es puramente presentacional.

3. **`B2BvsB2CComparison`** → **Dos tablas separadas** (B2B a la izquierda, B2C a la derecha),
   con `CategoryEntry[]` calculado en cliente para cada columna de porcentaje.

---

## AlertsTable — Explicación detallada: Opción A vs Opción B

### Opción A — Auto-contenido («carga propia»)

```
AlertsTable (props)
├── threshold: number              ← el App pasa 0.3 (o el que tenga)
├── groupBy: GroupBy               ← el App pasa "month"
├── startDate: string | undefined  ← el App pasa el DateFilterState
├── endDate: string | undefined    ← el App pasa el DateFilterState
├── businessType: BusinessType | undefined
├── apiBaseUrl: string             ← el App pasa la base URL
│
│   └── AlertsTable internamente:
│       1. Construye la URL con los query params
│       2. Hace fetch(apiBaseUrl + "/api/metrics/alerts?" + params)
│       3. Cachea o tipa la respuesta como AlertsResponse
│       4. Renderiza la tabla
│       5. Si falla, muestra error internamente
```

**Ventajas:**
- El `App` no necesita lógica de fetching de alertas; solo pasa valores.
- Si se reutiliza `AlertsTable` en otra página, lleva todo lo necesario.
- El fetch ocurre cuando cambian `threshold`, `groupBy` o las fechas, y es transparente.

**Desventajas:**
- El componente tiene efectos secundarios (llamada HTTP) — más difícil de testear
  y de depurar.
- Si quieres logs centralizados o manejo de errores unificado (`App` muestra un
  banner de error global), el error se queda dentro del componente.
- No puedes prefetchear las alertas antes de renderizar la página (si quisieras
  mostrar un spinner global en lugar de uno local).

### Opción B — Datos inyectados («recibe datos ya resueltos»)

```
App:
│   1. Escucha cambios en threshold, groupBy, fechas
│   2. Hace fetch(apiBaseUrl + "/api/metrics/alerts?" + params)
│   3. Pasa alerts: AlertEntry[] a AlertsTable
│
└── AlertsTable (props)
    ├── alerts: AlertEntry[]       ← ya resuelto por el App
    ├── loading: boolean           ← el App controla cuándo mostrar carga
    └── error: string | undefined  ← el App pasa el mensaje si falló
```

**Ventajas:**
- `AlertsTable` es puramente presentacional: recibe datos, los muestra. Sin efecto
  secundarios. Fácil de testear (solo render con datos conocidos).
- El `App` centraliza toda la orquestación: fetching, errores, logs.
- Puedes cachear, transformar o combinar los datos antes de pasarlos.

**Desventajas:**
- El `App` se vuelve más pesado: debe escuchar cambios en múltiples inputs y
  disparar el fetch correspondiente para cada funcionalidad.
- Si mañana se agregan más controles (ej. un slider para `groupBy`), el `App`
  debe añadir el nuevo listener y fetch.
- `AlertsTable` no es autónoma: requiere que el `App` orqueste su carga.

### Recomendación

**Opción B** es la que mejor se alinea con la arquitectura actual del proyecto:
- El `App.tsx` actual ya centraliza el fetching (`fetchFinancialData()` → luego
  pasa datos a los componentes).
- Los componentes actuales (`KPIRow`, `IncomeOutcomeChart`) son puramente
  presentacionales — reciben datos ya transformados.
- Mantiene consistencia: todo componente recibe datos, no hace fetch.
- El precio es que el `App` tendrá más lógica de orquestación, pero es un precio
  bajo comparado con tener componentes con efectos secundarios invisibles.