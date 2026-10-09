# Auditoría de Accesibilidad (WCAG 2.2)

> **Proyecto:** Financial Dashboard (4Geeks)  
> **Fecha inicial:** 2026-10-07  
> **Última revisión:** 2026-10-07 (contraste contra código fuente tras Rondas 1–5 de remediación)  
> **Estándar:** WCAG 2.2 (niveles A, AA)  
> **Skill usado:** `accessibility` v2.2  
> **Tipo:** Auditoría de código fuente (sin ejecución en vivo propia; se referencia una corrida de Lighthouse documentada en `progress.md`)

---

## Resumen ejecutivo

| Principio | Hallazgos | Resueltos | Abiertos |
|-----------|-----------|-----------|----------|
| **P**erceivable | 5 | 5 | 0 |
| **O**perable | 5 | 4 | 0 (1 nota, no aplica aún) |
| **U**nderstandable | 4 | 4 | 0 |
| **R**obust | 4 | 4 | 0 |

**Total:** 17 hallazgos identificados a lo largo de las revisiones — **17 resueltos** (Rondas 1–5, ver `memory-bank/progress.md`), **0 abiertos**.

---

## 🔴 Categoría 1 — Perceptible (Principle: Perceivable)

### 1.1 Falta de texto alternativo en iconos decorativos
**WCAG:** 1.1.1 (A) — Non-text Content | **Archivos:** `kpi-card.tsx`, `dashboard-header.tsx`, `kpi-row.tsx`
**Estado: ✅ Resuelto (Ronda 1)**

Los iconos SVG de `lucide-react` (`LayoutDashboard`, `TrendingUp`, `TrendingDown`, `DollarSign`, `BarChart2`) ahora llevan `aria-hidden="true"` tanto en el `<span>` contenedor como en el propio SVG, en `kpi-card.tsx` y `dashboard-header.tsx`. `kpi-row.tsx` hereda la solución al pasar los iconos a `KPICard`.

---

### 1.2 Gráficos sin alternativa textual
**WCAG:** 1.1.1 (A), 1.3.1 (A) | **Archivos:** `income-outcome-chart.tsx`, `profit-percent-chart.tsx`
**Estado: ✅ Resuelto (Ronda 2, mejorado en Ronda 4)**

Cada gráfico está envuelto en `<figure aria-labelledby="...-chart-title">`, con el `CardTitle` como `id` de referencia. Dentro de `<figcaption className="visually-hidden">` se incluye una tabla de datos equivalente. En Ronda 4 la tabla se envolvió además en `<details><summary>Ver datos como tabla</summary>` para que sea alcanzable por teclado (ver hallazgo 2.4).

---

### 1.3 Contraste de color
**WCAG:** 1.4.3 (AA) — Contrast (Minimum) | **Archivo:** `index.css`
**Estado: ✅ Resuelto (Ronda 3)**

Los tokens OKLCH no eran verificables mediante análisis estático, por lo que se implementó un conversor OKLCH → OKLab → sRGB → luminancia relativa (CIE) para calcular 23 pares de contraste críticos (texto/fondo, bordes, badges, charts, en light y dark). **Resultado: 23/23 pasan el umbral AA** (4.5:1 texto normal, 3:1 texto grande/UI). Verificado también con Lighthouse en vivo (contraste = pass). Variables ajustadas: `--primary`, `--ring`, `--chart-income/1`, `--destructive`, `--border`, `--input`, `--chart-4`, y los 6 tokens de badges (`--income-badge(-fg)`, `--outcome-badge(-fg)`, `--profit-badge(-fg)`), en `:root` y `.dark`. Detalle completo en `memory-bank/progress.md` (Ronda 3).

> Nota de proceso: por **R-18** (`.agents/rules/r18-frontend-theme.md`), estos ajustes se hicieron sobre los tokens centralizados de `index.css`, no con colores hardcodeados en componentes.

---

### 1.4 Foco visible — sin estilos personalizados
**WCAG:** 2.4.7 (AA), 2.4.11 (AA), 2.3 (reduced motion) | **Archivo:** `index.css`
**Estado: ✅ Resuelto (Ronda 1)**

Se añadieron reglas explícitas: `:focus-visible` (outline 2px `--ring`), `:focus` con `scroll-margin-top/bottom` (evita que el header oculte el elemento enfocado), y `@media (prefers-reduced-motion: reduce)` que neutraliza animaciones y transiciones.

---

### 1.5 Swatches de color decorativos en tooltips sin `aria-hidden`
**WCAG:** 1.1.1 (A) — Non-text Content | **Archivos:** `income-outcome-chart.tsx`, `profit-percent-chart.tsx`
**Estado: ✅ Resuelto (Ronda 4)**

Los `<span>` circulares con `backgroundColor` inline dentro de `CustomTooltip` (indicador de color junto al valor) ahora llevan `aria-hidden="true"`, ya que la información de color es redundante con el texto que los acompaña.

---

## 🟠 Categoría 2 — Operable (Principle: Operable)

### 2.1 Falta de skip link / bypass blocks
**WCAG:** 2.4.1 (A) — Bypass Blocks | **Archivos:** `index.html`, `App.tsx`
**Estado: ✅ Resuelto (Ronda 1)**

`index.html` incluye `<a href="#main-content" class="skip-link">Skip to main content</a>` como primer hijo de `<body>`, con estilos `.skip-link` / `.skip-link:focus` en `index.css` (oculto hasta recibir foco). `App.tsx` expone `id="main-content"` en el `<main>`.

---

### 2.2 Mensajes de error sin rol de alerta
**WCAG:** 4.1.3 (AA) — Status Messages | **Archivo:** `App.tsx`
**Estado: ✅ Resuelto (Ronda 1)**

El `<div>` de error ahora lleva `role="alert"`, por lo que los lectores de pantalla lo anuncian automáticamente al aparecer.

---

### 2.3 Pantalla de carga no anunciada
**WCAG:** 4.1.3 (AA) — Status Messages | **Archivos:** `App.tsx`, `kpi-card.tsx`, ambos charts
**Estado: ✅ Resuelto (Ronda 2)**

`<main>` y ambas `<section>` (KPIs y charts) llevan `aria-busy={loading}`. Los `Skeleton` individuales no necesitan `aria-hidden` propio porque el componente base ya lo aplica (ver 4.2).

---

### 2.4 Tooltips de gráficos no accesibles por teclado
**WCAG:** 2.1.1 (A) — Keyboard | **Archivos:** `income-outcome-chart.tsx`, `profit-percent-chart.tsx`
**Estado: ✅ Resuelto (Ronda 4, vía alternativa funcional)**

Los puntos de datos de Recharts solo muestran su `Tooltip` en hover de mouse y no son enfocables por teclado. En lugar de instrumentar cada punto del SVG (complejidad alta para un beneficio marginal), se expone la misma información mediante el `<details><summary>Ver datos como tabla</summary>` del hallazgo 1.2, que sí es alcanzable con `Tab` + `Enter`. Esto cubre la necesidad informativa, aunque no replica la interacción punto-a-punto del mouse.

---

### 2.5 Nota — Target size (no aplica todavía)
**WCAG:** 2.5.8 (AA, nuevo en 2.2)
**Estado: Sin cambios — no es un hallazgo activo**

El dashboard no tiene controles interactivos reales (botones, enlaces, inputs); el único "hover" (`KPICard`) es decorativo. Dejar como recordatorio para cuando se añadan controles (filtros, exportar, rango de fechas): verificar mínimo 24×24px.

---

## 🟡 Categoría 3 — Comprensible (Principle: Understandable)

### 3.1 Título de página poco descriptivo
**WCAG:** 2.4.2 (A) — Page Titled | **Archivo:** `index.html`
**Estado: ✅ Resuelto (Ronda 1)**

`<title>` cambiado de `frontend` a `Financial Dashboard — Executive Metrics`.

---

### 3.2 Las cards no tenían estructura semántica de heading
**WCAG:** 1.3.1 (A) — Info and Relationships | **Archivos:** `card.tsx`, `kpi-card.tsx`
**Estado: ✅ Resuelto (Ronda 2)**

`CardTitle` es ahora `<h2>` (en `card.tsx`) y el label de `KPICard` es `<h3>`. `DashboardHeader` ya usaba `<h1>` correctamente.

---

### 3.3 Orden de headings con salto de nivel (h1 → h3 antes que h2)
**WCAG:** 1.3.1 (A) — Info and Relationships | **Archivo:** `App.tsx`
**Estado: ✅ Resuelto (Ronda 5)**

**Corrección a `progress.md`:** ese documento describía originalmente el hallazgo de Lighthouse sobre "heading order" como un *falso positivo*, argumentando que la jerarquía real era `h1 → h2 → h3`. Al revisar el **orden real del DOM** en `App.tsx`, eso no era correcto:

```
DashboardHeader  → <h1> Financial Overview
KPIRow (×4)      → <h3> Total Income / Total Outcome / Profit / Profit Margin   ← aparecían ANTES
IncomeOutcomeChart → <h2> Income vs. Outcome
ProfitPercentChart → <h2> Profit Margin %
```

La secuencia lineal era `h1, h3, h3, h3, h3, h2, h2`: se saltaba el nivel `h2` entre el `h1` y el primer `h3`. Lighthouse/axe señalaban esto correctamente como un salto de nivel, no como falso positivo.

**Fix aplicado (Ronda 5):** se añadió un `<h2 id="kpi-section-heading" className="visually-hidden">Key performance indicators</h2>` como primer hijo de la sección de KPIs, y el `<section>` pasó de `aria-label` a `aria-labelledby="kpi-section-heading"`. La jerarquía resultante es `h1 → h2 (oculto) → h3 → h2`, sin saltos y sin cambios visuales. Detalle en `memory-bank/progress.md` (Ronda 5).

---

### 3.4 `CardDescription` renderizaba `<div>` en vez de `<p>`
**WCAG:** 1.3.1 (A) — Info and Relationships | **Archivo:** `card.tsx`
**Estado: ✅ Resuelto (Ronda 4)**

`CardDescription` cambió de `React.ComponentProps<'div'>` + `<div>` a `React.ComponentProps<'p'>` + `<p>`, correcto para texto descriptivo de párrafo.

---

## 🔴 Categoría 4 — Robusto (Principle: Robust)

### 4.1 Componentes sin landmarks semánticos
**WCAG:** 4.1.2 (A) — Name, Role, Value | **Archivo:** `card.tsx`
**Estado: ✅ Resuelto (Ronda 2)**

`Card` cambió de `<div>` a `<article>`. `DashboardHeader` ya usaba `<header>` correctamente, con el logo ya cubierto por el hallazgo 1.1 (`aria-hidden`).

---

### 4.2 Estados de skeleton loading no ignorables
**WCAG:** 4.1.2 (A) — Name, Role, Value | **Archivo:** `skeleton.tsx`
**Estado: ✅ Resuelto (Ronda 1)**

El componente base `Skeleton` lleva `aria-hidden="true"` directamente en `data-slot="skeleton"`, por lo que todos sus usos (KPICard, charts) quedan cubiertos sin tocar cada punto de uso.

---

### 4.3 Ausencia de `<figure>` para gráficos
**WCAG:** 1.3.1 (A) — Info and Relationships | **Archivos:** ambos charts
**Estado: ✅ Resuelto (Ronda 2)** — ver detalle en hallazgo 1.2.

---

### 4.4 Sin anuncio de fin de carga (`aria-live`)
**WCAG:** 4.1.3 (AA) — Status Messages | **Archivo:** `App.tsx`
**Estado: ✅ Resuelto (Ronda 4)**

Se añadió `<div role="status" className="visually-hidden">Dashboard data loaded successfully</div>`, visible solo para AT, renderizado cuando `!loading && !error`. Complementa el `aria-busy` del hallazgo 2.3 (que cubre el inicio de la carga, no su finalización).

---

## 📋 Resumen de fixes — estado consolidado

| # | Categoría | Hallazgo | WCAG | Severidad | Estado |
|---|-----------|----------|------|-----------|--------|
| 1.1 | Perceptible | Alt text en iconos decorativos | 1.1.1 (A) | 🔴 Crítico | ✅ Resuelto |
| 1.2 | Perceptible | Alternativa textual para gráficos | 1.1.1/1.3.1 (A) | 🔴 Crítico | ✅ Resuelto |
| 1.3 | Perceptible | Contraste de color | 1.4.3 (AA) | 🟠 Serio | ✅ Resuelto |
| 1.4 | Perceptible | Foco visible sin estilos | 2.4.7/2.4.11 (AA) | 🟠 Serio | ✅ Resuelto |
| 1.5 | Perceptible | Swatches de tooltip sin aria-hidden | 1.1.1 (A) | 🟡 Moderado | ✅ Resuelto |
| 2.1 | Operable | Skip link faltante | 2.4.1 (A) | 🔴 Crítico | ✅ Resuelto |
| 2.2 | Operable | Error sin role="alert" | 4.1.3 (AA) | 🟠 Serio | ✅ Resuelto |
| 2.3 | Operable | Loading no anunciado | 4.1.3 (AA) | 🟠 Serio | ✅ Resuelto |
| 2.4 | Operable | Tooltips no accesibles por teclado | 2.1.1 (A) | 🟠 Serio | ✅ Resuelto |
| 2.5 | Operable | Target size — nota, no aplica | 2.5.8 (AA) | — | ⚪ N/A |
| 3.1 | Comprensible | Título de página genérico | 2.4.2 (A) | 🟡 Moderado | ✅ Resuelto |
| 3.2 | Comprensible | Falta jerarquía de headings | 1.3.1 (A) | 🟡 Moderado | ✅ Resuelto |
| 3.3 | Comprensible | Salto de nivel h1→h3 antes de h2 | 1.3.1 (A) | 🟡 Moderado | ✅ Resuelto (Ronda 5) |
| 3.4 | Comprensible | CardDescription debería ser `<p>` | 1.3.1 (A) | 🟡 Moderado | ✅ Resuelto |
| 4.1 | Robusto | Landmarks/roles semánticos | 4.1.2 (A) | 🔴 Crítico | ✅ Resuelto |
| 4.2 | Robusto | Skeletons sin aria-hidden | 4.1.2 (A) | 🟡 Moderado | ✅ Resuelto |
| 4.3 | Robusto | Gráficos sin figure/figcaption | 1.3.1 (A) | 🟡 Moderado | ✅ Resuelto |
| 4.4 | Robusto | Sin anuncio de fin de carga | 4.1.3 (AA) | 🟡 Moderado | ✅ Resuelto |

**17/17 resueltos. 0 abiertos. 1 nota sin acción requerida (2.5 — target size, se activará cuando existan controles interactivos).**

---

## 🛠 Herramientas recomendadas para verificación en vivo

| Herramienta | Tipo | Uso |
|-------------|------|-----|
| axe DevTools | Browser extension | Auditoría automatizada rápida |
| WAVE | Browser extension | Visualización de errores ARIA |
| Lighthouse | Chrome nativo | Score de accesibilidad base |
| NVDA | Screen reader (Windows) | Prueba manual de navegación |
| Colour Contrast Analyser | App desktop | Verificación ratios de contraste |
| prefers-reduced-motion | CSS media query | Verificar animaciones reducidas |

---

## 🧪 Verificación en vivo (Lighthouse 13.5.0, `localhost:5173`)

Re-ejecutada el 2026-10-07 contra frontend (`npm run dev`, puerto 5173) + backend (`uvicorn`, puerto 8000) corriendo en local, tras aplicar el fix de Ronda 5. Resultado completo en `memory-bank/progress.md`:

| Métrica | Resultado |
|---------|-----------|
| **Accesibilidad global** | **100/100** ⬆️ (antes: 98/100) |
| **Contraste de color (1.4.3 AA)** | ✅ Pass (score=1) |
| **Skip link (2.4.1 A)** | ✅ Pass (`skip-link`: focusable) |
| **Document title (2.4.2 A)** | ✅ Pass |
| **ARIA attributes** | ✅ Todos pass (`aria-allowed-attr`, `aria-valid-attr-value`, `aria-hidden-focus`) |
| **HTML lang** | ✅ Pass |
| **Heading order** | ✅ Pass — confirma que el fix de Ronda 5 fue efectivo, no quedan huecos |
| **Landmark `main`** | ✅ Pass |
| **Links con nombre accesible** | ✅ Pass |

**0 auditorías de accesibilidad fallidas.** El score pasó de 98/100 a **100/100** tras corregir el salto de heading order (hallazgo 3.3).

> Próximos pasos sugeridos: (1) prueba manual con NVDA, (2) verificar target size (2.5.8) cuando se añadan controles interactivos.

---

> Este documento es la fuente única de verdad del estado de accesibilidad. El detalle de implementación de cada fix (diffs "antes/después") vive en `memory-bank/progress.md`; esta auditoría solo registra qué se encontró, por qué, y su estado actual, evitando duplicar el código ya documentado allí.

---

# Auditoría de Patrones Deployment-Oriented (vercel-react-best-practices)

> **Fecha:** 2026-10-08  
> **Skill usado:** `vercel-react-best-practices` v1.0.0 (45 reglas, 8 categorías)  
> **Tipo:** Auditoría de código fuente + build de producción (`npm run build` en `frontend/`)
> **Objetivo:** detectar patrones que afectan al despliegue (bundle, carga inicial, fetching, contenedor Docker, estáticos) siguiendo la guía de Vercel Engineering.

## Resumen ejecutivo

| Prioridad (skill) | Hallazgos | Críticos | Serios | Menores |
|-------------------|-----------|----------|--------|---------|
| Bundle Size (CRITICAL) | 3 | 1 | 1 | 1 |
| Client Data Fetching (MED-HIGH) | 2 | 0 | 1 | 1 |
| Re-render (MEDIUM) | 1 | 0 | 0 | 1 |
| Deployment / Infra (cross-cut) | 4 | 1 | 1 | 2 |
| JavaScript Performance (LOW-MEDIUM) | 2 | 0 | 0 | 2 |

**Total:** 12 hallazgos — **12/12 resueltos/cerrados — todos los hallazgos abordados (2026-10-08).**

> **Verificación independiente (2026-10-08):** se repitió esta auditoría desde cero (lectura de todos los componentes + `financial-utils.ts` + `npm run build`) sin consultar primero esta sección. Los 10 hallazgos originales (D1–D10) se confirman exactamente, incluidos los números de build (`585.86 kB` / `175.38 kB` gzip, idéntico hash de chunk). Única precisión: la cita de **R-14** en D7 es una analogía razonable pero no literal — el alcance declarado de esa regla (`.agents/rules/r14-development-server-only.md`) es el `Dockerfile` del **backend** (debugpy), no el del frontend. Se añaden además dos hallazgos nuevos (D11, D12) de la categoría "JavaScript Performance" de la skill, no cubierta en la pasada original.

**Evidencia de build (2026-10-08):** `npm run build` en `frontend/`:
- `dist/assets/index-*.js` → **585.86 kB** minificados (175.38 kB gzip)
- `dist/assets/index-*.css` → **18.53 kB** (4.54 kB gzip)
- Advertencia de Vite: *"Some chunks are larger than 500 kB after minification. Consider using dynamic import() to code-split"*
- Un solo chunk JS (únicos assets: 1 JS + 1 CSS); sin code-splitting.

---

## 🔴 Categoría 1 — Bundle Size (CRITICAL)

### D1. Chunk único de ~586 kB, sin code-splitting
**Skill:** `bundle-dynamic-imports` (2.4) | **Archivos:** `App.tsx`, ambos charts, `package.json`
**Estado: ✅ Resuelto (2026-10-08)**

Recharts (line/area/bar + utils de eje) se importaba de forma estática en `income-outcome-chart.tsx` y `profit-percent-chart.tsx`, y ambos charts se montaban en el primer render de `App.tsx`. Como no había `React.lazy`/`Suspense` ni `manualChunks`, todo el vendor (React + Recharts + Tailwind runtime) viajaba en un único chunk de 585.86 kB que supera el umbral de 500 kB advertido por Vite.

**Fix aplicado (2026-10-08):** en `App.tsx` los dos charts pasan a `React.lazy` con import dinámico (adaptación de named export → `default` via `.then(m => ({ default: m.X }))`), envueltos en `<Suspense>` con fallback de `Skeleton` (ya existentes y accesibles). Resultado del build:

| Chunk | Antes | Después | Gzip |
|-------|-------|---------|------|
| `index-*.js` (inicial) | 585.86 kB | **228.64 kB** | 72.66 kB |
| `LineChart-*.js` (Recharts, lazy) | — | 341.99 kB | 100.39 kB |
| `income-outcome-chart-*.js` | — | 10.47 kB | 3.51 kB |
| `profit-percent-chart-*.js` | — | 7.29 kB | 2.80 kB |
| CSS | 18.53 kB | 18.57 kB | 4.55 kB |

La advertencia ">500 kB" de Vite desaparece. **Validación:** `npm run build` ✅, `eslint src/App.tsx` ✅, `vitest` 5/5 ✅. Los chunks lazy se sirven con cache `immutable` gracias a `nginx.conf` (D7).

---

### D2. Imports barrel desde `lucide-react`
**Skill:** `bundle-barrel-imports` (2.1) | **Archivos:** `kpi-row.tsx`, `dashboard-header.tsx`
**Estado: ⚪ Cerrado (no requiere acción — tree-shaking de Vite mitiga)**

Se usa `import { TrendingUp, TrendingDown, ... } from 'lucide-react'` y `import { LayoutDashboard } from 'lucide-react'`. La guía documenta 200–800 ms de coste de import y ~1,583 módulos en la entrada del paquete (afecta arranque en dev y cold starts).

**Matiz para Vite:** a diferencia de Next (`external` en server), Vite sí bundlea `lucide-react` y aplica tree-shaking, por lo que el módulo final solo contiene los iconos usados. El coste real es menor que en el escenario Next de la guía, pero igualmente dispara la resolución de todo el grafo de módulos del paquete en cada build/arranque.

**Decisión:** no se modifica. Vite tree-shaking ya filtra iconos no usados del bundle final.

---

### D3. `mock-data.ts` es código muerto (no se importa)
**Skill:** `bundle-conditional` (2.2) | **Archivo:** `src/lib/mock-data.ts`
**Estado: ⚪ Cerrado (no requiere acción)**

`mockMovements` (360 movimientos) está definido pero **ningún módulo lo importa** — solo existe la definición. El backend ya sirve los datos simulados, así que es duplicado. Es *tree-shaken* del bundle al estar muerto, pero ensucia `src/` y puede confundir (sugiere un fallback offline que no existe).

**Decisión:** se mantiene por si es útil en tests futuros o storybook. No incrementa el bundle porque tree-shaking lo descarta del build.

---

## 🟠 Categoría 2 — Client-Side Data Fetching (MEDIUM-HIGH)

### D4. Fetch manual en `useEffect`, sin SWR ni cancelación
**Skill:** `client-swr-dedup` (4.2) | **Archivo:** `App.tsx`
**Estado: ✅ Resuelto (2026-10-08) — opción mínima de la skill (AbortController)**

`App.tsx` hacía `fetch` en un `useEffect([])` una sola vez, sin caché, revalidación ni `stale-while-revalidate`. Hoy hay una sola instancia del fetch, así que la dedup de SWR no aporta. Riesgos concretos:
- Sin `AbortController`, si el componente se desmonta antes de resolver la promesa, `setMetrics`/`setMonthlyData` corren sobre estado desmontado (React 19 lo tolera pero queda como warning/fuga).
- El fallo inicial no se reintenta (alineado con **R-13**).

**Fix aplicado (2026-10-08):** `fetchFinancialData` acepta un `AbortSignal` y el `useEffect` crea un `AbortController` con cleanup `controller.abort()`; los `.catch`/`.finally` ignoran la ejecución si la señal fue abortada (no pintan error de "API caída" por un desmontaje). Sin dependencias nuevas — se eligió la opción mínima recomendada por la skill en vez de añadir SWR, dado que solo hay un fetch one-shot.

**Validación:** `eslint src/App.tsx` ✅, `npm run build` ✅, `vitest` ✅ (detalle en Ronda 9 de `progress.md`).

**Nota:** reintento ante fallo inicial (**R-13**) sigue fuera de alcance — es regla de proyecto aparte, no de esta skill.

---

### D5. `aria-busy` + `role="status"` vs. render condicional one-shot
**Skill:** `client-` general (fetch lifecycle) | **Archivo:** `App.tsx`
**Estado: ⚪ Cerrado (nota de diseño, sin acción)**

El dashboard calcula KPIs y datos mensuales **en el cliente** a partir del payload crudo de `/api/metrics`. Esto es correcto para el volumen actual, pero en un deploy con más datos mueve trabajo y tráfico repetido al cliente sin caché (relacionado con `server-serialization` / `server-parallel-fetching` de la guía, que apuntan a minimizar lo que viaja al cliente). Hoy no hay N+1 ni waterfall: es **un** request único.

**Decisión:** mantener el diseño actual; cuando existan más endpoints (facets, alerts, top categories) revisar paralelización (`async-parallel`) y minimizar el payload serializado por request.

---

## 🟡 Categoría 3 — Re-render (MEDIUM)

### D6. Charts no memoizados; se re-renderizan en cada cambio de estado padre
**Skill:** `rerender-memo` (5.2) | **Archivos:** `income-outcome-chart.tsx`, `profit-percent-chart.tsx`
**Estado: ✅ Resuelto (2026-10-08)**

`IncomeOutcomeChart` y `ProfitPercentChart` recibían `data` y `loading` desde `App` y se re-renderizaban en cada transición de estado (p. ej. el toggle de `error`/`loading`). Recharts es la parte más cara del árbol.

**Fix:** envueltos ambos exports con `React.memo()`. Props (`data`, `loading`) son primitivos/estables — `data` es nueva referencia solo tras el fetch. Se importa `memo` como named export de `"react"` (disponible en React 19).

**Recomendación:** envolver ambos en `React.memo` y, si se pasa el flag `loading`, verificar que los props sean primitivos/estables (ya lo son: `data` es una referencia nueva solo tras el fetch).

---

## 🟠 Categoría 4 — Deployment / Infraestructura (cross-cut)

### D7. `frontend/Dockerfile` es solo dev-server (sin etapa de build estático)
**Skill:** deployment build patterns | **Archivos:** `frontend/Dockerfile`, `frontend/Dockerfile.prod`, `frontend/nginx.conf`, `frontend/.dockerignore`
**Estado: ✅ Resuelto (2026-10-08)**

El `CMD` es `npm run dev -- --host 0.0.0.0 --port 5173` con `RUN npm install` y montado como volumen en Compose. Es una configuración de desarrollo (el **Dockerfile dev se mantiene intacto** para el flujo Compose de R-11; la analogía con **R-14** es que la producción debe ser una configuración aparte y explícita — R-14 declara su alcance formal sobre el Dockerfile del backend). Para producción no existía etapa multi-stage (`npm ci` + `npm run build` + servir `dist`), ni healthcheck (`R-12`).

**Fix aplicado (2026-10-08):** se añadieron tres archivos, sin tocar el `Dockerfile` de desarrollo ni el `docker-compose.yml`:

| Archivo | Contenido |
|---------|-----------|
| `frontend/Dockerfile.prod` | Multi-stage: etapa `build` (`node:24-alpine`, `npm ci` según **R-16**, `npm run build`) + etapa `runtime` (`nginx:1.27-alpine` sirviendo `/app/dist`), `EXPOSE 80`, `CMD ["nginx", "-g", "daemon off;"]` |
| `frontend/nginx.conf` | `/assets/*` → `Cache-Control: public, max-age=31536000, immutable`; `index.html` → `no-cache`; SPA fallback `try_files ... /index.html` (construye además la base de D8) |
| `frontend/.dockerignore` | Excluye `node_modules`, `dist`, `.env*` (salvo `.env.example`), logs y configs de editor — evita pisar el `npm ci` con artefactos locales |

**Validación:** `npm ci --dry-run` → *up to date* (lockfile sincronizado) y `npm run build` → OK (585.86 kB JS / 18.53 kB CSS, sin errores). **Limitación:** Docker no está disponible en esta máquina, por lo que la imagen no se compiló aquí — verificar con `docker build -f Dockerfile.prod .` en un entorno con Docker. Build sugerido: `docker build -f Dockerfile.prod -t financial-dashboard:prod .`

**Nota de enlace (D8):** `nginx.conf` ya cubre los headers de caché; D8 se cerró el mismo día añadiendo `vercel.json` con las mismas políticas (ver más abajo).

---

### D8. Sin `vercel.json` / sin configuración de SPA-rewrite ni headers
**Skill:** deployment config | **Archivos:** `frontend/vercel.json`, `frontend/nginx.conf`
**Estado: ✅ Resuelto (2026-10-08)**

No existía `vercel.json`. Para un SPA de un solo `<main>` no hace falta rewrite de rutas hoy, pero no había políticas de caché (el JS con hash debería servirse `immutable`, el `index.html` `no-cache`) ni declaración de preset/output.

**Fix aplicado (2026-10-08):**

| Archivo | Contenido |
|---------|-----------|
| `frontend/vercel.json` | `framework: vite`, `buildCommand: npm run build`, `outputDirectory: dist`, `cleanUrls`, headers: `/assets/*` → `immutable` (1 año), `/index.html` → `no-cache` — mismas políticas que `nginx.conf` (D7) para que el deploy sea idéntico en contenedor o en Vercel |
| `frontend/nginx.conf` | (D7) — equivalentes de los headers anteriores en el target contenedor |

**Nota:** no se definió `base` en `vite.config.ts` porque no hay evidencia de deploy bajo subpath (se despliega en raíz); si algún día se sirve bajo `/subpath/`, añadir `base` explícita. El SPA-rewrite lo cubren `try_files` (nginx) y `cleanUrls`+fallback de Vercel (SPA framework preset).

---

### D9. Config de API acoplada al build (`VITE_API_BASE_URL` + proxy de Compose)
**Skill:** deployment env | **Archivos:** `App.tsx`, `vite.config.ts`, `.env.example`
**Estado: ✅ Resuelto (2026-10-08)**

`VITE_API_BASE_URL` está bien documentada en `.env.example`, pero Vite la incrusta **en build-time**; el proxy `target: http://backend:8000` solo funcionaba dentro de la red de Compose. Un deploy necesitaba un `VITE_API_BASE_URL` apuntando a la API desplegada y, según **R-15**, los orígenes autorizados del CORS del backend (hoy `allow_origins=["*"]`, no apto para producción).

**Fix aplicado (2026-10-08):**

| Archivo | Cambio |
|---------|--------|
| `frontend/vite.config.ts` | Proxy `/api` ahora configurable: `VITE_DEV_PROXY_URL` (env) con default `http://localhost:8000` → el dev server funciona **fuera de Compose** sin editar config (R-11) |
| `docker-compose.yml` | El servicio `frontend` inyecta `VITE_DEV_PROXY_URL=http://backend:8000` → flujo de Compose intacto (R-11) |
| `backend/app/main.py` | `allow_origins` ahora desde env `ALLOWED_ORIGINS` (coma-separado); default `*` solo para dev local, en deploy se fija `ALLOWED_ORIGINS="https://tu-dominio.com"` (R-15) |
| `frontend/Dockerfile.prod` | `ARG/ENV VITE_API_BASE_URL` en la etapa build → `docker build --build-arg VITE_API_BASE_URL=https://api...` inyecta la API en el bundle |
| `frontend/.env.example` | Documentado: la variable se hornea en build-time, cómo pasarla como build-arg y que el origen debe entrar también en `ALLOWED_ORIGINS` |

**Validación:** `pytest backend/tests` → **15/15 ✅** (sin test de CORS que se rompa); `npm run build` ✅ (chunks idénticos a D1); dev server con el config nuevo → **HTTP 200 ✅**.

**Nota:** el `healthcheck` R-12 sigue pendiente en `docker-compose.yml` (fuera del alcance de este hallazgo).

---

### D10. `index.html` sin `meta description` / OG; sin configuración de perf budget en CI
**Skill:** SEO/perf baseline | **Archivos:** `index.html`, `lighthouse-budget.json`, `scripts/check-budget.js`
**Estado: ✅ Resuelto (2026-10-08)**

Título, viewport y favicon presentes (y correctos desde la auditoría WCAG), pero faltaba `meta description` y etiquetas Open Graph, y no había budget de performance en CI. `lighthouse-report.json` existe en raíz de una corrida manual, pero no hay pipeline que lo haga fallar.

**Fix aplicado (2026-10-08):**

| Archivo | Cambio |
|---------|--------|
| `frontend/index.html` | Añadido `meta description`, `meta theme-color`, OG: `title`, `description`, `type`, `url` |
| `frontend/lighthouse-budget.json` | Budget de performance: total ≤620 kB, script ≤580 kB, stylesheet ≤50 kB, accesibilidad ≥0.9, performance ≥0.6 |
| `frontend/scripts/check-budget.js` | Script Node.js que recorre `dist/`, mapea extensiones a resource types y valida contra budget; exit 1 si falla |
| `frontend/package.json` | Nuevo script `build:check`: `npm run build && node scripts/check-budget.js` para CI |

**Validación:** `node scripts/check-budget.js` → ✅ total 602.75 kB / 620 kB, script 574.74 kB / 580 kB, stylesheet 18.14 kB / 50 kB. Build completo ✅ (466ms).

---

## 🟢 Categoría 5 — JavaScript Performance (LOW-MEDIUM)

### D11. `computeKPIs` itera el array 4 veces en vez de 1
**Skill:** `js-combine-iterations` (7.6) | **Archivo:** `src/lib/financial-utils.ts:21-34`
**Estado: ✅ Resuelto (2026-10-08)**

`computeKPIs` hacía `movements.filter(income).reduce(...)` y luego `movements.filter(outcome).reduce(...)`: dos `.filter()` + dos `.reduce()`, es decir 4 pasadas sobre el mismo array para calcular `totalIncome`/`totalOutcome`. Con 360 movimientos el costo real es insignificante, pero el patrón es exactamente el que cubre la regla `js-combine-iterations`.

**Fix:** reemplazado por un único `for...of` que acumula `totalIncome`/`totalOutcome` en una sola pasada. Sin cambios de API ni de lógica.

---

### D12. `formatCurrency` crea un `Intl.NumberFormat` nuevo en cada llamada
**Skill:** `js-cache-function-results` (7.4) | **Archivo:** `src/lib/financial-utils.ts:69-76`
**Estado: ✅ Resuelto (2026-10-08)**

Cada llamada a `formatCurrency` instanciaba `new Intl.NumberFormat(...)`. Se invoca repetidamente por render: 4 veces en `KPIRow`, y por cada fila/mes de la tabla oculta de datos y los tooltips de `income-outcome-chart.tsx`. `Intl.NumberFormat` no es gratis de construir.

**Fix:** movido el formatter a constante `currencyFormatter` a nivel de módulo (`const currencyFormatter = new Intl.NumberFormat(...)`) y reutilizado en `.format(value)`.

---

## 📋 Resumen consolidado

| # | Categoría (skill) | Hallazgo | Severidad | Estado |
|---|-------------------|----------|-----------|--------|
| D1 | Bundle Size | Chunk único 585.86 kB sin code-splitting | 🔴 Crítico | ✅ Resuelto (2026-10-08) |
| D2 | Bundle Size | Imports barrel de `lucide-react` | 🟠 Serio (matiz Vite) | ⚪ Cerrado (tree-shaking mitiga) |
| D3 | Bundle Size | `mock-data.ts` código muerto | 🟡 Menor | ⚪ Cerrado (no requiere acción) |
| D4 | Data Fetching | Fetch manual sin SWR/abort en `useEffect` | 🟠 Serio | ✅ Resuelto (2026-10-08) |
| D5 | Data Fetching | Cálculo en cliente, un solo request (nota) | 🟡 Menor | ⚪ Cerrado (nota de diseño) |
| D6 | Re-render | Charts sin `memo` | 🟡 Menor | ✅ Resuelto (2026-10-08) |
| D7 | Deployment | Dockerfile solo dev-server, sin build estático | 🔴 Crítico | ✅ Resuelto (2026-10-08) |
| D8 | Deployment | Sin `vercel.json` / headers / `base` | 🟠 Serio | ✅ Resuelto (2026-10-08) |
| D9 | Deployment | API acoplada a build-time + CORS wildcard | 🟠 Serio | ✅ Resuelto (2026-10-08) |
| D10 | Deployment | Sin meta/OG ni perf budget en CI | 🟡 Menor | ✅ Resuelto (2026-10-08) |
| D11 | JS Performance | `computeKPIs` itera el array 4 veces | 🟡 Menor | ✅ Resuelto (2026-10-08) |
| D12 | JS Performance | `formatCurrency` no cachea `Intl.NumberFormat` | 🟡 Menor | ✅ Resuelto (2026-10-08) |

**12/12 resueltos/cerrados — todos los hallazgos abordados (2026-10-08).**

> **Revisión de D11 y D12 (2026-10-08):** ambos verificados contra `financial-utils.ts` y confirmados exactos. Por pertinencia en el orden: `js-*` es categoría 7/8 (LOW-MEDIUM) de la skill, por lo que D11/D12 quedan **detrás de D6** (`rerender-memo`, categoría 5) y antes de los hallazgos sin acción directa. Matiz de impacto: D11 se ejecuta una sola vez por fetch (no por render) sobre 360 registros → despreciable; D12 ahorra instanciación de `Intl.NumberFormat` por render en `KPIRow` y tablas/tooltips → modesto pero de fix trivial (una línea cada uno), por eso van antes del "resto".

> **Estado WCAG anterior:** la sección de accesibilidad (17/17 resueltos) **no cambia**; esta auditoría es ortogonal y no toca el código. Ninguna de las recomendaciones D1–D12 debería regresar hallazgos de accesibilidad si se implementa con los patrones ya adoptados (Skeleton accesible en fallbacks de `Suspense`, `aria-busy` mantenido, etc.). **Al cierre de la sesión (2026-10-08), los 12 hallazgos están resueltos o cerrados.**

---

## 3. Archivos descartables (candidatos a revisión)

Archivos identificados durante la sesión como potencialmente innecesarios, listados para revisión humana. **Ninguno ha sido borrado.**

| Archivo | Problema | Recomendación |
|---------|----------|---------------|
| `lighthouse-report.json` (raíz) | Corrida manual Lighthouse 13.5.0 del 2026-10-07. No lo consume ningún pipeline. Los budgets de CI ahora están en `frontend/lighthouse-budget.json`. | 🟡 Reemplazable — el report completo pesa ~1 MB. Mantener solo si se necesita como histórico. |
| `frontend/specs/components.ts` | **No existe.** El `README.md` del directorio lo menciona, pero nunca se creó. | 🟢 Eliminar la referencia del README o crear el archivo si está pendiente. |
| `frontend/specs/` (directorio: `api-types.ts`, `param-types.ts`, `components.md`, `README.md`) | Especificaciones de tipos que duplican los tipos reales en `src/lib/financial-types.ts`. No se importan desde `src/`. Documentación estática que puede desactualizarse. | 🟡 Valor documental — útil como referencia, pero no es fuente de verdad. Requiere sincronización manual si los tipos cambian. |
| `frontend/src/assets/hero.png` | Nunca se importa en ningún archivo de `frontend/src/`. No referenciado en CSS, HTML, ni componentes. | 🟢 Candidato a eliminar — código muerto. |
| `frontend/src/lib/mock-data.ts` | Código muerto (D3, ⚪ Cerrado). No se importa. Tree-shakeado del bundle pero ensucia `src/`. | 🟡 Mantener o eliminar — ya documentado como cerrado sin acción. Útil si se planean tests o storybook. |
| `ruleset_propuesto.md` (raíz) | Resumen de las reglas ya instaladas en `.agents/rules/`. | 🟡 Documentación — útil como visión general, pero la fuente de verdad son los archivos individuales en `.agents/rules/`. |
| `validacion_reglas.md` (raíz) | Bitácora de probes de validación de reglas. Ya completada. | 🟡 Histórico — mantener por trazabilidad del proyecto. |
| `verification.md` (raíz) | Mapeo del proyecto desactualizado (no refleja `Dockerfile.prod`, `nginx.conf`, `vercel.json`, `scripts/`, etc.). | 🟢 Desactualizado — si no se mantiene, pierde valor. |
| `AGENTS.md` (raíz) | Guía breve para agentes (3 líneas apuntando a `.agents/rules/`, `.agents/skills/`, `memory-bank/`). | 🟡 Util — pequeño, no pesa, cumple su función. |
