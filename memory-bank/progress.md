# Progress — Accesibilidad WCAG 2.2

> **Proyecto:** Financial Dashboard (4Geeks)  
> **Última actualización:** 2026-10-07 (verificación Lighthouse incluida)  
> **Skill:** `accessibility` v2.0

---

## 📋 Estado general

| Hito | Estado | WCAG |
|------|--------|------|
| Auditoría inicial | ✅ Completada | `memory-bank/AUDITORIA.md` |
| Fixes críticos de bajo esfuerzo | ✅ Completados | Ronda 1 — 4 fixes + 1 bonus |
| Ronda 2 — medio esfuerzo | ✅ Completados | Landmarks, headings, gráficos, aria-busy |
| Contraste de color WCAG 1.4.3 AA | ✅ Completada | Ronda 3 — 23/23 pares verificados |
| Hallazgos 13–16 WCAG 2.2 A/AA | ✅ Completada | Ronda 4 — keyboard tooltips, swatches, CardDescription, aria-live |
| Orden de headings (hallazgo 3.3) | ✅ Completada | Ronda 5 — h2 oculto en sección de KPIs |

---

## ✅ Ronda 1 — Fixes críticos de bajo esfuerzo

### 1.1 Título de página descriptivo
| Campo | Valor |
|-------|-------|
| **WCAG** | 2.4.2 (A) — Page Titled |
| **Archivo** | `frontend/index.html` |
| **Cambio** | `<title>frontend</title>` → `<title>Financial Dashboard — Executive Metrics</title>` |
| **Skill** | Sección *Page language (3.1.1)* + *Page Titled (2.4.2)* |

### 1.2 Skip link "Saltar al contenido principal"
| Campo | Valor |
|-------|-------|
| **WCAG** | 2.4.1 (A) — Bypass Blocks |
| **Archivo** | `frontend/index.html` |
| **Cambio** | Insertado `<a href="#main-content" class="skip-link">` como primer hijo de `<body>` |
| **Skill** | Sección *Skip links (2.4.1)*: *"Provide a skip link so keyboard users can bypass repetitive navigation"* |

### 1.3 Estilos accesibilidad en CSS
| Campo | Valor |
|-------|-------|
| **WCAG** | 2.4.1 (A), 2.4.7 (AA), 2.4.11 (AA), 2.3 |
| **Archivo** | `frontend/src/index.css` |
| **Cambio** | Añadidos 63 líneas al final del archivo |

| Bloque | Propósito |
|--------|-----------|
| `.skip-link` | Oculta visualmente el skip link, visible solo al recibir foco (`:focus`) |
| `.skip-link:focus` | Muestra el enlace con fondo `--primary`, outline `--ring`, z-index alto |
| `:focus-visible` | Outline de 2px solid `--ring` con `outline-offset: 2px` |
| `:focus` | `scroll-margin-top: 80px` y `scroll-margin-bottom: 60px` (2.4.11 AA) |
| `@media (prefers-reduced-motion: reduce)` | Desactiva animaciones y transiciones (2.3) |

### 1.4 Mensaje de error con `role="alert"`
| Campo | Valor |
|-------|-------|
| **WCAG** | 4.1.3 (AA) — Status Messages |
| **Archivo** | `frontend/src/App.tsx` |
| **Cambio** | `<div className="...">` → `<div role="alert" className="...">` |
| **Skill** | Sección *Live regions (4.1.3)*: *"Use aria-live regions to announce dynamic content changes without moving focus"* |

### 1.5 Anchor para skip link en `<main>`
| Campo | Valor |
|-------|-------|
| **WCAG** | 2.4.1 (A) — Bypass Blocks |
| **Archivo** | `frontend/src/App.tsx` |
| **Cambio** | `<main className="...">` → `<main id="main-content" className="...">` |
| **Skill** | Misma instrucción que 1.2 — el skip link necesita un destino |

### 1.6 Icono decorativo oculto — DashboardHeader
| Campo | Valor |
|-------|-------|
| **WCAG** | 1.1.1 (A) — Non-text Content |
| **Archivo** | `frontend/src/components/dashboard/dashboard-header.tsx` |
| **Cambio** | Añadido `aria-hidden="true"` al `<span>` contenedor y al SVG `<LayoutDashboard>` |
| **Skill** | Sección *Text alternatives (1.1)*: *"Icon buttons need accessible names — usar `aria-hidden="true"` en SVG decorativos"* |

```tsx
// Antes
<span className="flex h-9 w-9 ...">
  <LayoutDashboard size={18} />
</span>

// Después
<span aria-hidden="true" className="flex h-9 w-9 ...">
  <LayoutDashboard size={18} aria-hidden="true" />
</span>
```

### 1.7 Iconos decorativos ocultos — KPICard
| Campo | Valor |
|-------|-------|
| **WCAG** | 1.1.1 (A) — Non-text Content |
| **Archivo** | `frontend/src/components/dashboard/kpi-card.tsx` |
| **Cambio** | Añadido `aria-hidden="true"` al `<span>` badge y al `<Icon>` SVG |
| **Skill** | Misma instrucción que 1.6 |

```tsx
// Antes
<span className={cn('p-1.5 rounded-lg', styles.badge)}>
  <Icon size={16} className={styles.icon} />
</span>

// Después
<span aria-hidden="true" className={cn('p-1.5 rounded-lg', styles.badge)}>
  <Icon size={16} className={styles.icon} aria-hidden="true" />
</span>
```

### 1.8 Skeletons ignorados por screen readers
| Campo | Valor |
|-------|-------|
| **WCAG** | 4.1.2 (A) — Name, Role, Value |
| **Archivo** | `frontend/src/components/ui/skeleton.tsx` |
| **Cambio** | Añadido `aria-hidden="true"` al `<div data-slot="skeleton">` |
| **Skill** | Sección *Common issues by impact → Critical* |

```tsx
// Antes
<div data-slot="skeleton" className={cn('bg-accent animate-pulse rounded-md', className)}>

// Después
<div data-slot="skeleton" aria-hidden="true" className={cn('bg-accent animate-pulse rounded-md', className)}>
```

---

## ✅ Ronda 2 — Landmarks, headings, gráficos, loading

### 2.1 Landmarks semánticos — Card → `<article>`, CardTitle → `<h2>`
| Campo | Valor |
|-------|-------|
| **WCAG** | 4.1.2 (A) — Name, Role, Value |
| **Archivo** | `frontend/src/components/ui/card.tsx` |
| **Skill** | Sección *ARIA usage (4.1.2)*: *"Prefer native elements"* |

```tsx
// Card: <div> → <article>
function Card({ className, ...props }: React.ComponentProps<'article'>) {
  return (
    <article data-slot="card" ... />

// CardTitle: <div> → <h2>
function CardTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2 data-slot="card-title" ... />
```

### 2.2 Jerarquía de headings — KPICard label a `<h3>`
| Campo | Valor |
|-------|-------|
| **WCAG** | 1.3.1 (A) — Info and Relationships |
| **Archivo** | `frontend/src/components/dashboard/kpi-card.tsx` |
| **Skill** | Sección *Testing checklist → Manual testing → Focus order* |

```tsx
// <span> → <h3> para jerarquía: h1(header) → h2(card) → h3(kpi)
<h3 className="text-sm font-medium text-muted-foreground tracking-wide uppercase text-pretty">
  {label}
</h3>
```

### 2.3 Alternativa textual — IncomeOutcomeChart
| Campo | Valor |
|-------|-------|
| **WCAG** | 1.1.1 (A) — Non-text Content + 1.3.1 (A) |
| **Archivo** | `frontend/src/components/dashboard/income-outcome-chart.tsx` |
| **Skill** | Sección *Text alternatives (1.1)*: *"Complex image with longer description"* |

**Cambios:**
- Añadido `id="income-outcome-chart-title"` al `<CardTitle>`
- Chart envuelto en `<figure aria-labelledby="income-outcome-chart-title">`
- Añadido `<figcaption className="visually-hidden">` con tabla de datos accesible

### 2.4 Alternativa textual — ProfitPercentChart
| Campo | Valor |
|-------|-------|
| **WCAG** | 1.1.1 (A) — Non-text Content + 1.3.1 (A) |
| **Archivo** | `frontend/src/components/dashboard/profit-percent-chart.tsx` |
| **Skill** | Misma instrucción que 2.3 |

**Cambios:**
- Añadido `id="profit-percent-chart-title"` al `<CardTitle>`
- Chart envuelto en `<figure aria-labelledby="profit-percent-chart-title">`
- Añadido `<figcaption className="visually-hidden">` con tabla de datos accesible

### 2.5 Estados de loading con `aria-busy`
| Campo | Valor |
|-------|-------|
| **WCAG** | 4.1.3 (AA) — Status Messages |
| **Archivo** | `frontend/src/App.tsx` |
| **Skill** | Sección *Live regions (4.1.3)* |

```tsx
// <main> con aria-busy
<main id="main-content" aria-busy={loading} className="dark min-h-screen ...">

// <section> KPIs con aria-busy
<section aria-label="Key performance indicators" aria-busy={loading}>

// <section> charts con aria-busy
<section aria-label="Financial charts" aria-busy={loading} className="grid ...">
```

---

## ✅ Ronda 3 — Contraste de color WCAG 1.4.3 AA

### Resumen

| Métrica | Valor |
|---------|-------|
| **WCAG** | 1.4.3 (AA) — Contrast (Minimum) |
| **Umbrales** | Texto normal ≥4.5:1 — Texto grande / UI ≥3:1 |
| **Pares verificados** | 23 (20 texto/UI + 3 badge internos) |
| **Estado** | ✅ 23/23 pasan |
| **Archivo** | `frontend/src/index.css` |
| **Motor de verificación** | Python con conversión OKLCH → OKLab → sRGB → Y (CIE luminancia relativa) |
| **Lighthouse** | ✅ Contraste: score=1 (pass), Accesibilidad global: **98/100** |

### Cambios en variables CSS (`frontend/src/index.css`)

#### Modo claro (`:root`)

| Variable | Antes | Después | Ratio WCAG |
|----------|-------|---------|-----------|
| `--primary` / `--ring` / `--chart-income` / `--chart-1` | `oklch(0.55 0.2 255)` | `oklch(0.53 0.2 255)` | 4.51:1 ✅ |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.55 0.245 27.325)` | 4.94:1 ✅ |
| `--border` / `--input` | `oklch(0.88 0.01 240)` | `oklch(0.55 0.01 240)` | 4.61:1 ✅ |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | `oklch(0.675 0.189 84.429)` | 3.03:1 ✅ |
| `--income-badge` | `oklch(0.93 0.06 155)` | `oklch(0.61 0.06 155)` | 3.63:1 ✅ |
| `--income-badge-fg` | `oklch(0.35 0.12 155)` | `oklch(0.93 0.12 155)` | 3.00:1 ✅ |
| `--outcome-badge` | `oklch(0.95 0.06 25)` | `oklch(0.61 0.06 25)` | 3.75:1 ✅ |
| `--outcome-badge-fg` | `oklch(0.42 0.15 27)` | `oklch(0.94 0.15 27)` | 3.01:1 ✅ |
| `--profit-badge` | `oklch(0.93 0.04 255)` | `oklch(0.61 0.04 255)` | 3.61:1 ✅ |
| `--profit-badge-fg` | `oklch(0.38 0.15 255)` | `oklch(0.93 0.15 255)` | 3.07:1 ✅ |

#### Modo oscuro (`.dark`)

| Variable | Antes | Después | Ratio WCAG |
|----------|-------|---------|-----------|
| `--primary` / `--ring` / `--chart-income` / `--chart-1` | `oklch(0.6 0.2 255)` | `oklch(0.53 0.2 255)` | 4.51:1 ✅ |
| `--muted-foreground` | `oklch(0.62 0.01 240)` | `oklch(0.635 0.01 240)` | 4.62:1 ✅ |
| `--border` / `--input` | `oklch(0.26 0.015 240)` | `oklch(0.53 0.015 240)` | 3.07:1 ✅ |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | `oklch(0.675 0.189 84.429)` | 5.04:1 ✅ |
| `--income-badge` | `oklch(0.25 0.08 155)` | `oklch(0.54 0.08 155)` | 3.22:1 ✅ |
| `--income-badge-fg` | `oklch(0.72 0.16 155)` | `oklch(0.85 0.16 155)` | 3.09:1 ✅ |
| `--outcome-badge` | `oklch(0.25 0.07 25)` | `oklch(0.54 0.07 25)` | 3.09:1 ✅ |
| `--outcome-badge-fg` | `oklch(0.72 0.16 27)` | `oklch(0.86 0.16 27)` | 3.09:1 ✅ |
| `--profit-badge` | `oklch(0.22 0.05 255)` | `oklch(0.54 0.05 255)` | 3.24:1 ✅ |
| `--profit-badge-fg` | `oklch(0.72 0.16 255)` | `oklch(0.84 0.16 255)` | 3.06:1 ✅ |

### Detalle técnico

- **Motor de contraste:** Python con conversión OKLCH → OKLab → RGB lineal → Y (luminancia relativa CIE, fórmula `Y = 0.2126·R + 0.7152·G + 0.0722·B`)
- **Fórmula WCAG:** `(LighterY + 0.05) / (DarkerY + 0.05)`
- **Validación:** Lighthouse accessibility audit score = 98/100, contraste = pass

---

## ✅ Ronda 4 — Hallazgos 13–16 (WCAG 2.2 A/AA)

### Resumen

| # | Hallazgo | WCAG | Severidad | Esfuerzo | Estado |
|---|----------|------|-----------|----------|--------|
| 13 | Tooltips de charts no accesibles por teclado | 2.1.1 (A) Keyboard | 🟠 Serio | 🟡 Medio | ✅ |
| 14 | Swatches de color en tooltip sin `aria-hidden` | 1.1.1 (A) Non-text Content | 🟡 Moderado | 🟢 Bajo | ✅ |
| 15 | `CardDescription` debería ser `<p>` | 1.3.1 (A) Info and Relationships | 🟡 Moderado | 🟢 Bajo | ✅ |
| 16 | Sin anuncio de fin de carga (`aria-live`) | 4.1.3 (AA) Status Messages | 🟡 Moderado | 🟢 Bajo | ✅ |

---

### 4.1 (#14) — Swatches de color en tooltip con `aria-hidden`

| Campo | Valor |
|-------|-------|
| **WCAG** | 1.1.1 (A) — Non-text Content |
| **Archivos** | `income-outcome-chart.tsx`, `profit-percent-chart.tsx` |
| **Cambio** | Añadido `aria-hidden="true"` a los `<span className="inline-block h-2 w-2 rounded-full">` decorativos dentro de `CustomTooltip` |

```tsx
// Antes
<span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />

// Después
<span aria-hidden="true" className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
```

---

### 4.2 (#15) — `CardDescription` de `<div>` a `<p>`

| Campo | Valor |
|-------|-------|
| **WCAG** | 1.3.1 (A) — Info and Relationships |
| **Archivo** | `frontend/src/components/ui/card.tsx` |
| **Cambio** | `ComponentProps<'div'>` → `ComponentProps<'p'>`, `<div>` → `<p>` |

```tsx
// Antes
function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-description" className={cn('text-muted-foreground text-sm', className)} {...props} />
  )
}

// Después
function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p data-slot="card-description" className={cn('text-muted-foreground text-sm', className)} {...props} />
  )
}
```

**Verificación:** Los 2 usos de `CardDescription` (`income-outcome-chart.tsx`, `profit-percent-chart.tsx`) contienen solo texto plano — compatibles con `<p>`.

---

### 4.3 (#16) — Anuncio de fin de carga con `role="status"`

| Campo | Valor |
|-------|-------|
| **WCAG** | 4.1.3 (AA) — Status Messages |
| **Archivo** | `frontend/src/App.tsx` |
| **Cambio** | Añadido `<div role="status" className="visually-hidden">` condicional (`!loading && !error`) |

```tsx
// Nuevo — después del bloque de error
{!loading && !error ? (
  <div role="status" className="visually-hidden">Dashboard data loaded successfully</div>
) : null}
```

**Complementa:** Hallazgo #8 (Ronda 2) que añadió `aria-busy={loading}` — ahora se anuncia explícitamente cuando los datos están listos.

---

### 4.4 (#13) — Keyboard-accessible tooltips con `<details><summary>`

| Campo | Valor |
|-------|-------|
| **WCAG** | 2.1.1 (A) — Keyboard |
| **Archivos** | `income-outcome-chart.tsx`, `profit-percent-chart.tsx` |
| **Cambio** | La tabla de datos oculta (Ronda 2) se envuelve en `<details><summary>Ver datos como tabla</summary>` dentro del `<figcaption>`. Navegable con <kbd>Tab</kbd> + <kbd>Enter</kbd>. |

```tsx
{/* Antes — tabla dentro de figcaption, no operable por teclado */}
<figcaption className="visually-hidden">
  <table>...</table>
</figcaption>

{/* Después — tabla dentro de details/summary, expandible con teclado */}
<figcaption className="visually-hidden">
  <details>
    <summary>Ver datos como tabla</summary>
    <table>...</table>
  </details>
</figcaption>
```

---

### CSS añadido

| Clase | Propósito |
|-------|-----------|
| `.visually-hidden` | Ocultar visualmente pero accesible para lectores de pantalla (mismo patrón que `.skip-link`). Se usa en charts (Rondas 2 y 4) y en el `role="status"` (Ronda 4). |

**Nota:** Esta clase ya se usaba en los charts desde Ronda 2 pero **no estaba definida en el CSS**. Se añadió en Ronda 4 para que funcione correctamente.

---

## ✅ Ronda 5 — Corrección de orden de headings (hallazgo 3.3)

### Resumen

| Campo | Valor |
|-------|-------|
| **WCAG** | 1.3.1 (A) — Info and Relationships |
| **Archivo** | `frontend/src/App.tsx` |
| **Severidad** | 🟡 Moderado |

**Corrección sobre el análisis previo:** la Ronda 4 (y la verificación Lighthouse de más abajo) daban por **falso positivo** el aviso de "heading order" de Lighthouse, asumiendo una jerarquía `h1 → h2 → h3`. Al revisar el orden real del DOM en `App.tsx`, la sección de KPIs (`KPIRow`, cuatro `<h3>` vía `KPICard`) se renderiza **antes** que los `<h2>` de los charts, produciendo la secuencia lineal `h1, h3, h3, h3, h3, h2, h2` — un salto real de `h1` a `h3` sin `h2` intermedio. No era un falso positivo. Ver `memory-bank/AUDITORIA.md` (hallazgo 3.3) para el detalle del análisis.

**Cambio:** se añadió un `<h2>` visualmente oculto como primer hijo de la sección de KPIs, y el `<section>` pasó de `aria-label` a `aria-labelledby` apuntando a ese heading — preserva el diseño visual y restaura la jerarquía `h1 → h2 → h3 → h2`.

```tsx
// Antes
<section aria-label="Key performance indicators" aria-busy={loading}>
  <KPIRow metrics={metrics} loading={loading} />
</section>

// Después
<section aria-labelledby="kpi-section-heading" aria-busy={loading}>
  <h2 id="kpi-section-heading" className="visually-hidden">
    Key performance indicators
  </h2>
  <KPIRow metrics={metrics} loading={loading} />
</section>
```

No se requirió CSS nuevo: `.visually-hidden` ya existía desde Ronda 4.

---

## 📊 Resumen global de cambios (Ronda 1 + Ronda 2 + Ronda 3 + Ronda 4 + Ronda 5)

| Archivo | Ronda | Cambio | Tipo |
|---------|-------|--------|------|
| `frontend/index.html` | 1 | +2 / -1 | HTML |
| `frontend/src/index.css` | 1 | +63 líneas de estilos a11y | CSS |
| `frontend/src/index.css` | 3 | 20 variables de color corregidas (10 light + 10 dark) | CSS |
| `frontend/src/index.css` | 4 | +12 líneas: `.visually-hidden` | CSS |
| `frontend/src/App.tsx` | 1 + 2 + 4 + 5 | +15 / -5 | TypeScript/React |
| `frontend/src/components/dashboard/dashboard-header.tsx` | 1 | +2 / -1 | TypeScript/React |
| `frontend/src/components/dashboard/kpi-card.tsx` | 1 + 2 | +3 / -2 | TypeScript/React |
| `frontend/src/components/ui/skeleton.tsx` | 1 | +1 / -0 | TypeScript/React |
| `frontend/src/components/ui/card.tsx` | 2 + 4 | +4 / -4 | TypeScript/React |
| `frontend/src/components/dashboard/income-outcome-chart.tsx` | 2 + 4 | +34 / -4 | TypeScript/React |
| `frontend/src/components/dashboard/profit-percent-chart.tsx` | 2 + 4 | +34 / -4 | TypeScript/React |

**Total:** 10 archivos modificados, **0 errores** de compilación/linting.

---

## 🧪 Verificación Lighthouse en vivo

### Primera corrida (tras Rondas 1–4)

Lighthouse 13.5.0 se ejecutó contra el frontend en `http://localhost:5173/` tras las Rondas 1–4. El resultado de "heading order" se señaló inicialmente como falso positivo (ver corrección en Ronda 5 arriba) — score: **98/100**.

### Segunda corrida — re-ejecutada tras Ronda 5 (2026-10-07)

Se levantó el stack en local (backend: `./.venv/Scripts/python.exe -m uvicorn app.main:app --port 8000`; frontend: `VITE_API_BASE_URL=http://localhost:8000 npm run dev -- --port 5173`, siguiendo `r11-local-development.md`) y se corrió:

```bash
npx lighthouse http://localhost:5173/ --only-categories=accessibility \
  --output=json --output=html --chrome-flags="--headless=new --no-sandbox"
```

| Métrica | Resultado |
|---------|-----------|
| **Accesibilidad global** | **100/100** ⬆️ (antes: 98/100) |
| **Contraste de color (1.4.3 AA)** | ✅ Pass (score=1) |
| **Skip link (2.4.1 A)** | ✅ Pass (`skip-link`) |
| **Document title (2.4.2 A)** | ✅ Pass |
| **ARIA attributes** | ✅ Todos pass (`aria-allowed-attr`, `aria-valid-attr-value`, `aria-hidden-focus`) |
| **HTML lang** | ✅ Pass |
| **Heading order** | ✅ **Pass** — confirma que el fix de Ronda 5 (h2 oculto en la sección de KPIs) resolvió el salto de nivel |
| **Landmark `main`** | ✅ Pass |
| **Links con nombre accesible** | ✅ Pass |
| **Performance/SEO** | 📊 No auditados (dev server sin optimizar, `--only-categories=accessibility`) |

**Resultado:** 0 auditorías de accesibilidad fallidas en esta corrida. El score subió de 98/100 a **100/100** tras el fix de Ronda 5.

> **Próximos pasos sugeridos:**
> - Prueba manual con NVDA para verificar la experiencia de lectores de pantalla
> - Verificar cumplimiento de target size (2.5.8 AA) cuando se añadan controles interactivos

---

- [Auditoría completa](memory-bank/AUDITORIA.md)
- [Skill de accesibilidad](.agents/skills/accessibility/SKILL.md)
- [Referencia WCAG 2.2](.agents/skills/accessibility/references/WCAG.md)