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
