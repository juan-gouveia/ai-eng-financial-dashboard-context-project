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

## Ronda 6 — Remediación deployment (D7): `Dockerfile.prod` multi-stage

> **Fecha:** 2026-10-08
> **Hallazgo:** D7 de la auditoría `vercel-react-best-practices` (`memory-bank/AUDITORIA.md`)
> **Reglas aplicadas:** R-14 (nunca usar CMD de dev como config de prod — aquí como analogía, alcance formal en backend), R-16 (`npm ci`, no regenerar lockfile), R-11 (Compose dev intacto), R-12 (healthcheck pendiente en compose, ver nota)
> **Decisión de diseño:** se crea `Dockerfile.prod` **separado** en lugar de reescribir el `Dockerfile` existente, para no romper el flujo de desarrollo por Compose (R-11: `docker-compose.yml` construye `./frontend` con el Dockerfile por defecto y CMD de dev + volumen).

### Archivos nuevos

| Archivo | Propósito |
|---------|-----------|
| `frontend/Dockerfile.prod` | Multi-stage: etapa `build` (`FROM node:24-alpine`, `WORKDIR /app`, `COPY package.json package-lock.json`, `RUN npm ci`, `COPY . .`, `RUN npm run build`) + etapa `runtime` (`FROM nginx:1.27-alpine`, copia `nginx.conf` y `/app/dist` → `/usr/share/nginx/html`, `EXPOSE 80`, `CMD ["nginx", "-g", "daemon off;"]`). Sin CMD de dev (R-14). |
| `frontend/nginx.conf` | `/assets/` → `Cache-Control: public, max-age=31536000, immutable` (assets con hash); `index.html` → `no-cache`; SPA fallback `try_files $uri $uri/ /index.html`. |
| `frontend/.dockerignore` | `node_modules`, `dist`, `dist-ssr`, `coverage`, `.pytest_cache`, `*.log`, `.env*` (salvo `.env.example`), `.git`, `.vscode`, `.idea`. Evita que `COPY . .` pise el `npm ci` con `node_modules` locales. |

### Validación

| Prueba | Comando | Resultado |
|--------|---------|-----------|
| Lockfile sincronizado con `package.json` | `npm ci --dry-run` en `frontend/` | ✅ *up to date in 2s* (70 packages funding) — la etapa `RUN npm ci` del build no fallaría por desincronización |
| Etapa de build | `npm run build` (`tsc -b && vite build`) | ✅ OK (585.86 kB JS / 175.38 kB gzip / 18.53 kB CSS) — ejecutado esta misma sesión |
| Compilación de la imagen | `docker build -f Dockerfile.prod .` | ⚠️ **No ejecutable en esta máquina** — Docker no está instalado (sin CLI, Desktop, WSL ni podman). Pendiente de verificar en un entorno con Docker. |

### Notas y deuda abierta

- **Imagen sin compilar:** la corrección de sintaxis de los tres archivos es manual (no hay lint de Dockerfile disponible aquí); el smoke test real queda registrado en D7 como limitación.
- **D8 parcialmente cubierto:** los headers de caché que D8 pedía (`immutable` para assets) ya viven en `nginx.conf`; si el target de deploy es Vercel y no contenedor, sigue faltando `vercel.json`/`base`.
- **R-12 / healthcheck:** `Dockerfile.prod` no declara `HEALTHCHECK`; el healthcheck con `condition: service_healthy` corresponde a `docker-compose.yml` (fuera del alcance de este fix, no se modificó compose).
- **`VITE_API_BASE_URL`:** la app hace `fetch(${API_BASE_URL}/api/metrics)` con base vacía por defecto → en producción bajo nginx se espera `GET /api/metrics` en el mismo origen o un proxy; queda asociado a D9 (no tocado en esta ronda).

---

## Ronda 7 — Remediación bundle (D1): code-splitting de Recharts con `React.lazy`

> **Fecha:** 2026-10-08
> **Hallazgo:** D1 de la auditoría `vercel-react-best-practices` (`memory-bank/AUDITORIA.md`)
> **Skill:** `bundle-dynamic-imports` (2.4)
> **Archivo tocado:** `frontend/src/App.tsx` (único)

### Cambio

| Antes | Después |
|-------|---------|
| `import { IncomeOutcomeChart } from "..."` y `import { ProfitPercentChart }` estáticos en `App.tsx` | `const X = lazy(() => import("...").then(m => ({ default: m.X })))` — adaptación de named export a `default` requerida por `React.lazy` |
| Charts montados directamente en el `<section>` | Envueltos en `<Suspense fallback={<Skeleton .../>}>` (skeletons equivalentes a los internos de cada chart: título + área 280px) |
| Sin `manualChunks` | No hizo falta: el import dinámico ya separó Recharts automáticamente (rolldown/Vite asigna `LineChart-*.js` como chunk compartido) |

### Evidencia de build (`npm run build`, 2026-10-08)

| Chunk | Antes | Después | Gzip |
|-------|-------|---------|------|
| `index-*.js` (inicial) | **585.86 kB** | **228.64 kB** | 72.66 kB |
| `LineChart-*.js` (Recharts, lazy) | — | 341.99 kB | 100.39 kB |
| `income-outcome-chart-*.js` | — | 10.47 kB | 3.51 kB |
| `profit-percent-chart-*.js` | — | 7.29 kB | 2.80 kB |
| `index-*.css` | 18.53 kB | 18.57 kB | 4.55 kB |

- JS inicial: **−61%** (585.86 → 228.64 kB).
- La advertencia de Vite "*Some chunks are larger than 500 kB*" **desaparece**.
- 2291 módulos transformados, build en 515 ms.

### Validación

| Prueba | Resultado |
|--------|-----------|
| `npm run build` (`tsc -b && vite build`) | ✅ sin errores |
| `npx eslint src/App.tsx` | ✅ sin warnings |
| `npm test` (vitest) | ✅ 5/5 tests, 1 archivo |

### Notas

- **Accesibilidad:** el fallback de `Suspense` usa `Skeleton` (ya validado en rondas WCAG) dentro de la `<section aria-busy={loading}>` existente; no se introducen regresiones (la sección de charts ya estaba marcada `aria-busy`).
- **Comportamiento:** los chunks lazy se piden en el primer render (charts visibles de inmediato), pero quedan fuera del bundle crítico inicial → mejora TTI/LCP; con los headers `immutable` de `nginx.conf` (D7) se cachean entre sesiones.
- **D2 pendiente:** los imports barrel de `lucide-react` siguen en `kpi-row.tsx`/`dashboard-header.tsx` (mitigados por tree-shaking, ahora irrelevante para el peso inicial ya que el chunk se redujo).

---

## Ronda 8 — Remediación deployment (D8 + D9): vercel.json, proxy configurable y CORS por env

> **Fecha:** 2026-10-08
> **Hallazgos:** D8 y D9 de la auditoría `vercel-react-best-practices` (`memory-bank/AUDITORIA.md`)
> **Reglas:** R-11 (Compose como default local), R-15 (CORS wildcard no apto para prod)

### D8 — `frontend/vercel.json` (nuevo)

| Campo | Valor |
|-------|-------|
| `framework` | `vite` (activa SPA-fallback + detección de build) |
| `buildCommand` / `outputDirectory` | `npm run build` / `dist` |
| `cleanUrls` | `true` |
| headers `/assets/(.*)` | `Cache-Control: public, max-age=31536000, immutable` |
| headers `/index.html` | `Cache-Control: no-cache` |

Mismas políticas que `nginx.conf` (D7) → deploy idéntico en contenedor o Vercel. **No** se definió `base` en `vite.config.ts`: no hay evidencia de deploy bajo subpath (se sirve en raíz); se documenta la condición para añadirla.

### D9 — cambios (5 archivos)

| Archivo | Antes | Después |
|---------|-------|---------|
| `frontend/vite.config.ts` | `target: "http://backend:8000"` hardcodeado (solo Compose) | `VITE_DEV_PROXY_URL ?? "http://localhost:8000"` → dev server funciona fuera de Compose sin editar config (R-11) |
| `docker-compose.yml` | sin env en `frontend` | `environment: VITE_DEV_PROXY_URL=http://backend:8000` → flujo Compose intacto |
| `backend/app/main.py` | `allow_origins=["*"]` fijo | `ALLOWED_ORIGINS` desde env (coma-separado), default `*` solo en dev local; deploy: `ALLOWED_ORIGINS="https://tu-dominio.com"` (R-15) |
| `frontend/Dockerfile.prod` | sin ARG de API | `ARG/ENV VITE_API_BASE_URL` en etapa build → `--build-arg VITE_API_BASE_URL=https://api...` |
| `frontend/.env.example` | comentario genérico | documenta build-time, build-arg y el requisito de `ALLOWED_ORIGINS` en el backend |

### Validación

| Prueba | Resultado |
|--------|-----------|
| `pytest backend/tests` | ✅ 15/15 (el cambio de CORS no rompe tests) |
| `npm run build` | ✅ chunks idénticos a Ronda 7 (228.64 / 341.99 / 10.47 / 7.29 kB) |
| Dev server con config nuevo (`cmd /c npm run dev`) | ✅ HTTP 200 en `localhost:5173`, proxy parsea sin error |

### Notas

- **Comportamiento del default de proxy:** `localhost:8000` fuera de Compose significa que `docker compose up` **sin** la env inyectada no llegaría al backend `backend:8000` — por eso el env va en `docker-compose.yml` (verificado solo en código; compose no se ejecutó: Docker no disponible).
- **R-12 pendiente:** healthcheck de compose sigue sin implementar (alcance del fix de D7 declaró esto; R-12 no está ligado a D8/D9).
- El `allow_credentials=True` con `ALLOWED_ORIGINS="*"` (dev) sigue siendo inseguro en sí mismo; en deploy se debe fijar siempre la env (mitigación documentada, no se fuerza error en dev para no romper el flujo actual).

---

## Ronda 9 — Remediación data-fetching (D4): cancelación con `AbortController`

> **Fecha:** 2026-10-08
> **Hallazgo:** D4 de la auditoría `vercel-react-best-practices` (`memory-bank/AUDITORIA.md`)
> **Skill:** `client-swr-dedup` (4.2)
> **Archivo tocado:** `frontend/src/App.tsx` (único)

### Cambio

| Antes | Después |
|-------|---------|
| `fetchFinancialData()` sin señal | `fetchFinancialData(signal: AbortSignal)` → `fetch(url, { signal })` |
| `useEffect([])` sin cleanup | Crea `new AbortController()`, cleanup `return () => controller.abort()` |
| `.catch`/`.finally` siempre activos | Ambos guardan `if (controller.signal.aborted) return;` → un desmontaje no pinta "API caída" ni deja `loading` a medias |

- **Opción elegida:** el fix mínimo de la skill (`AbortController`), **sin** añadir SWR — solo hay un fetch one-shot, la dedup/caché de SWR no aportaría y meter una dependencia nueva no justifica el alcance de D4.
- **R-13** (reintento en fallo inicial) queda fuera de alcance: es regla de proyecto, no de esta skill.

### Validación

| Prueba | Resultado |
|--------|-----------|
| `node_modules/.bin/eslint src/App.tsx` | ✅ exit 0, sin warnings |
| `npm run build` | ✅ chunks estables: 228.75 kB inicial (+0.11 kB), 341.99 / 10.47 / 7.29 kB |
| `npm test` (vitest) | ✅ 5/5 tests |

### Notas

- El tamaño inicial subió 0.11 kB (228.64 → 228.75 kB) — insignificante frente al −61% de D1.
- Comportamiento en React 19: `AbortError` de `fetch` llega al `.catch`, que lo filtra por `signal.aborted` → sin estado de error falso.
- Incidente operativo: un intento previo de validación con `npx eslint` en cadena colgó el terminal; se repitió con binario local + comandos separados (exit 0). No afecta al resultado.

---

## Ronda 10 — Remediación re-render (D6): memoización de charts con `React.memo`

> **Fecha:** 2026-10-08
> **Hallazgo:** D6 de la auditoría `vercel-react-best-practices` (`memory-bank/AUDITORIA.md`)
> **Skill:** `rerender-memo` (5.2)
> **Archivos tocados:** `income-outcome-chart.tsx`, `profit-percent-chart.tsx`

### Cambio

| Antes | Después |
|-------|---------|
| `export function IncomeOutcomeChart(...)` | `export const IncomeOutcomeChart = memo(function IncomeOutcomeChart(...){...})` |
| `export function ProfitPercentChart(...)` | `export const ProfitPercentChart = memo(function ProfitPercentChart(...){...})` |
| Sin import de `memo` | `import { memo } from "react"` |

- `memo()` es export nativo de React 19; envuelve la función y cachea por igualdad de props.
- Props (`data`, `loading`) son estables: `data` solo cambia de referencia tras fetch, `loading` es booleano.
- No se tocó el interior de las funciones; la lógica de Recharts, CustomTooltip, data.map en figcaption table, loading skeleton, etc. queda idéntica.

### Validación

| Prueba | Resultado |
|--------|-----------|
| `node_modules/.bin/eslint` (ambos archivos) | ✅ exit 0, sin warnings |
| `npm run build` | ✅ 432ms, chunks estables: 228.75 / 341.99 / 10.49 / 7.31 / 18.57 kB |
| `npm test` (vitest) | ✅ 5/5 tests (264ms) |

### Notas

- Fix trivial (3 líneas por archivo) — uno de los cambios más rápidos de la sesión.
- Los tamaños de chunk son idénticos a los de Ronda 9 (D4) porque `memo()` es una función del runtime de React, no afecta al bundling.
- La priorización sugerida en AUDITORIA.md se actualizó: **D6 resuelto → D12/D11 como siguientes**, luego resto (D2, D3, D5, D10).

---

## Ronda 11 — JS Performance (D12): hoist `Intl.NumberFormat` a constante de módulo

> **Fecha:** 2026-10-08
> **Hallazgo:** D12 de la auditoría `vercel-react-best-practices` (`memory-bank/AUDITORIA.md`)
> **Skill:** `js-cache-function-results` (7.4)
> **Archivo tocado:** `src/lib/financial-utils.ts` (único)

### Cambio

| Antes | Después |
|-------|---------|
| `new Intl.NumberFormat(...)` creado dentro de `formatCurrency()` en cada llamada | `const currencyFormatter = new Intl.NumberFormat(...)` a nivel de módulo; `formatCurrency` usa `currencyFormatter.format(value)` |

- Fix de una línea: mover la instanciación del formatter fuera de la función.
- El formatter se instancia una vez al cargar el módulo; reutilizado en cada llamada a `formatCurrency` (KPIRow, tablas, tooltips).

### Validación

| Prueba | Resultado |
|--------|-----------|
| `node_modules/.bin/eslint src/lib/financial-utils.ts` | ✅ exit 0, sin warnings |
| `npm run build` | ✅ 400ms, chunks estables (228.76 kB inicial, +0.01 kB irrelevante) |
| `npm test` (vitest) | ✅ 5/5 tests (273ms) |

### Notas

- Fix mínimo y directo; impacto en rendimiento modesto pero acumulativo (cada render de KPIRow + tooltips + tablas ocultas).
- El `+0.01 kB` en el chunk inicial es por el nombre de variable ligeramente más largo; no afecta al bundle neto.

---

## Ronda 12 — JS Performance (D11): combinar iteraciones en `computeKPIs`

> **Fecha:** 2026-10-08
> **Hallazgo:** D11 de la auditoría `vercel-react-best-practices` (`memory-bank/AUDITORIA.md`)
> **Skill:** `js-combine-iterations` (7.6)
> **Archivo tocado:** `src/lib/financial-utils.ts` (único)

### Cambio

| Antes | Después |
|-------|---------|
| `movements.filter(income).reduce(...)` y `movements.filter(outcome).reduce(...)` — 4 pasadas | Un único `for...of` que acumula `totalIncome`/`totalOutcome` en una pasada |
| `let` no usado | `let totalIncome = 0; let totalOutcome = 0` con acumulación inline |

- Sin cambios de API, firma ni semántica de retorno.
- `for...of` sobre array de 360 elementos — costo real insignificante antes y después, pero patrón corregido.

### Validación

| Prueba | Resultado |
|--------|-----------|
| `node_modules/.bin/eslint src/lib/financial-utils.ts` | ✅ exit 0, sin warnings |
| `npm run build` | ✅ 418ms, chunks estables (228.73 kB inicial, −0.02 kB) |
| `npm test` (vitest) | ✅ 5/5 tests (248ms) |

### Notas

- El chunk inicial se redujo 0.02 kB (228.75 → 228.73) — los nombres de variable son más cortos que los chains de `.filter().reduce()`.
- Último hallazgo de JS Performance completado. Quedan 4 abiertos (D2, D3, D5, D10) — todos menor prioridad.

---

## Ronda 13 — Deployment (D10): meta/OG tags y perf budget en CI

> **Fecha:** 2026-10-08
> **Hallazgo:** D10 de la auditoría `vercel-react-best-practices` (`memory-bank/AUDITORIA.md`)
> **Skill:** SEO/perf baseline
> **Archivos tocados:** `index.html`, `scripts/check-budget.js`, `frontend/lighthouse-budget.json`, `package.json` (script)

### Cambios

| Archivo | Cambio |
|---------|--------|
| `frontend/index.html` | Añadido `<meta name="description">`, `<meta name="theme-color" content="#0a0a0a">`, OG tags: `title`, `description`, `type`, `url` |
| `frontend/lighthouse-budget.json` | Budget: total ≤620 kB, script ≤580 kB, stylesheet ≤50 kB, accesibilidad ≥0.9, performance ≥0.6 |
| `frontend/scripts/check-budget.js` | Script Node.js ESM: recorre `dist/`, mapea extensiones a resource types, valida contra budget; exit 1 si falla |
| `frontend/package.json` | Script `build:check`: `npm run build && node scripts/check-budget.js` para CI |

### Validación

| Prueba | Resultado |
|--------|-----------|
| `node scripts/check-budget.js` | ✅ total 602.75 kB / 620 kB, script 574.74 kB / 580 kB, stylesheet 18.14 kB / 50 kB |
| `npm run build` | ✅ 466ms, chunks estables |
| ESLint | ✅ sin errores |

### Notas

- D2, D3, D5 cerrados como "no requiere acción". Todos los 12 hallazgos abordados.
- Build check script usa Node.js nativo (no TypeScript, no dependencias adicionales).

---

- [Auditoría completa](memory-bank/AUDITORIA.md)
- [Skill de accesibilidad](.agents/skills/accessibility/SKILL.md)
- [Referencia WCAG 2.2](.agents/skills/accessibility/references/WCAG.md)