---
name: api-contract-sync
description: Guía paso a paso para conectar o documentar un endpoint de /api/metrics en este repo, manteniendo sincronizados modelo Pydantic, tipo TS de consumo, TypeSpec de contrato y API_Reference.md. Usar al conectar un endpoint backend existente al frontend, al añadir uno nuevo, o al auditar si la documentación de la API está completa.
---

# API Contract Sync

> v1.0 — Validado. Generado a partir del gap documentado en [memory-bank/specific_gaps.md](../../../memory-bank/specific_gaps.md) (Gap 1) y probado con un dry-run sobre `/api/metrics/summary` (sin tocar el repo), que ajustó el Paso 2. Adoptado como guía de referencia para sincronizar el contrato de `/api/metrics` entre backend y frontend.

## Overview

En este repo, cada endpoint bajo `/api/metrics` tiene hasta **4 lugares** que deberían estar sincronizados, pero no hay generación automática entre ellos — todo es manual:

1. **Modelo Pydantic** en `backend/app/routes.py` (fuente de verdad del shape real).
2. **Tipo TS de consumo** en `frontend/src/lib/financial-types.ts` (lo que el frontend usa en runtime).
3. **TypeSpec de contrato** en `frontend/specs/api-types.ts` (documentación de interfaz, no se importa desde `src/`).
4. **Entrada en `memory-bank/API_Reference.md`** (documentación legible para humanos/agentes).

Hoy, de los 8 endpoints bajo `/api/metrics`, solo 3 (`facets`, `alerts`, `categories/top`) tienen los 4 puntos sincronizados. Los otros 5 (`/api/metrics` base, `/summary`, `/comparison`, `/b2b`, `/b2c`) solo tienen el paso 1. Este skill existe para que, al tocar cualquiera de esos 5 (o al añadir un endpoint nuevo), no se repita la asimetría.

Esta skill reemplaza y operacionaliza `.agents/rules/r01-api-contract-sync.md`: esa regla dice *qué* mantener sincronizado; esta skill da el *orden de pasos* y una checklist verificable.

## Cuándo usar

- Vas a hacer que el frontend consuma un endpoint que hoy no usa (`/summary`, `/comparison`, `/b2b`, `/b2c`, o la base `/api/metrics` para un propósito nuevo).
- Vas a añadir un endpoint nuevo en `backend/app/routes.py`.
- Vas a cambiar el shape de la respuesta de un endpoint existente (campo nuevo, renombrado, tipo cambiado).
- Te piden auditar si `API_Reference.md` o `frontend/specs/api-types.ts` están completos.

**Cuándo NO usar:** cambios que no tocan el contrato (lógica interna, estilos, performance de un endpoint sin cambiar su respuesta).

## Estado actual de cobertura (referencia rápida)

| Endpoint | Pydantic (`routes.py`) | Tipo en `financial-types.ts` | TypeSpec en `api-types.ts` | Entrada en `API_Reference.md` |
|---|---|---|---|---|
| `GET /api/metrics` (base) | ✅ `FinancialMovement` | ✅ `FinancialMovement` | ❌ | ❌ |
| `GET /api/metrics/facets` | ✅ `MetricsFacets` | — | ✅ `FacetsResponse` | ✅ |
| `GET /api/metrics/summary` | ✅ `MetricsSummaryItem` | ❌ | ❌ | ❌ |
| `GET /api/metrics/categories/top` | ✅ `TopCategoryItem` | — | ✅ `TopCategoriesResponse` | ✅ |
| `GET /api/metrics/comparison` | ✅ `MetricsComparison` | ❌ | ❌ | ❌ |
| `GET /api/metrics/alerts` | ✅ `MetricsAlert` | — | ✅ `AlertsResponse` | ✅ |
| `GET /api/metrics/b2b` | ✅ `FinancialMovement` | ✅ (reusa) | ❌ | ❌ |
| `GET /api/metrics/b2c` | ✅ `FinancialMovement` | ✅ (reusa) | ❌ | ❌ |

(`—` = no necesita tipo propio porque reusa uno existente. `❌` = gap a cerrar si se conecta ese endpoint.)

## El flujo (5 pasos, en orden)

```
1. LEER     → Confirma el modelo Pydantic real en routes.py (no asumas por el nombre)
2. TIPAR    → Añade/actualiza el tipo en financial-types.ts (lo que el frontend importa)
3. CONTRATO → Añade/actualiza el TypeSpec en frontend/specs/api-types.ts
4. DOCUMENTAR → Añade/actualiza la sección en memory-bank/API_Reference.md
5. VERIFICAR → Tests en ambos lados + checklist final
```

### Paso 1: Leer el modelo real

No copies desde la documentación existente (puede estar desactualizada) — lee `backend/app/routes.py` directamente para el endpoint en cuestión. Anota:
- Nombre exacto de cada campo y su tipo Python (`date`, `float`, `str`, `Literal[...]`).
- Parámetros de query: nombre, tipo, requerido/opcional, default, rango válido.
- `response_model` declarado en el decorador `@router.get(...)`.

### Paso 2: Tipar en `financial-types.ts`

Si el endpoint devuelve un shape nuevo (no reutiliza `FinancialMovement`), añade la interfaz ahí — es el archivo que el frontend realmente importa. Usa `string` para cualquier `date` Pydantic (FastAPI serializa a `YYYY-MM-DD`; ver nota en `r01-api-contract-sync.md`). Reusa los union types existentes (`Category`, `OperationType`, `BusinessType`) en lugar de redeclarar los valores.

**No te limites al tipo de respuesta: revisa también los *parámetros* de query.** Algunos ya existen en `frontend/specs/api-types.ts` por otro endpoint sin conectar (p. ej. `GroupBy`, usado hoy por `alerts`), pero nunca llegaron a `financial-types.ts` porque ese otro endpoint tampoco está conectado al frontend. Si el endpoint que estás conectando comparte un parámetro con uno de esos, defínelo aquí en lugar de esperar a que lo haga "el primero en conectarse" — evita que el mismo union type se declare dos veces con nombres o valores ligeramente distintos.

### Paso 3: Contrato en `frontend/specs/api-types.ts`

Sigue el patrón ya usado por `FacetsResponse`/`AlertsResponse`/`TopCategoriesResponse`:
- Un `interface` para los parámetros de query (`<Nombre>RequestParams`), si el endpoint acepta alguno.
- Un `interface` o `type` para la respuesta (`<Nombre>Response`).
- Comentario con el endpoint real (`GET /api/metrics/...`) encima del tipo.

Este archivo no se importa desde `src/` — es documentación de contrato, no código ejecutable. Si ya hiciste el Paso 2, este paso es casi mecánico: mismo shape, formato de "spec" en vez de tipo de consumo.

### Paso 4: Documentar en `memory-bank/API_Reference.md`

Sigue la estructura ya usada por las 3 secciones existentes:
- Título `## \`GET /ruta\``
- Tabla de parámetros de query (si aplica)
- Tabla del schema de respuesta
- Ejemplo de request + response en JSON real (ejecuta el endpoint si puedes, no inventes valores)
- Sección "Lógica de Negocio" con los pasos de cálculo, si el endpoint agrega o transforma datos (no es un passthrough)

Actualiza también el índice de "Endpoints Documentados" al inicio del archivo.

### Paso 5: Verificar

Ver checklist abajo. No cierres la tarea sin pasar los 3 primeros ítems — son el núcleo de "qué significa estar sincronizado" en este repo.

## Checklist de verificación

- [ ] El tipo en `financial-types.ts` tiene exactamente los mismos campos/tipos que el `response_model` de `routes.py` (sin campos inventados ni faltantes)
- [ ] El TypeSpec en `api-types.ts` existe para el endpoint y coincide con el tipo de consumo
- [ ] `API_Reference.md` tiene una sección para el endpoint, con ejemplo de respuesta real (no inventado)
- [ ] El índice de "Endpoints Documentados" en `API_Reference.md` incluye el endpoint nuevo
- [ ] Si cambiaste `Category`/`OperationType`/`BusinessType`, actualizaste los 3 lugares que los redeclaran (`routes.py` Literal, `financial-types.ts`, `api-types.ts`)
- [ ] Tests actualizados: `backend/tests/test_routes.py` para el shape de respuesta; `frontend/src/lib/financial-utils.test.ts` si el frontend consume y transforma el dato
- [ ] Si el endpoint usa fechas, se mantiene el formato ISO `YYYY-MM-DD` en el tipo TS (`string`, no `Date`) — ver `.agents/rules/r19-iso-date-handling.md`

## Red flags

- Conectar un endpoint al frontend usando `any` o un tipo inline en el componente en vez de declararlo en `financial-types.ts`
- Copiar el ejemplo de JSON de `API_Reference.md` de otro endpoint en vez de ejecutar el real
- Tocar `api-types.ts` sin tocar `financial-types.ts` (o viceversa) — divergen con el primer cambio
- Añadir un campo nuevo a un modelo Pydantic sin tocar ninguno de los 3 lugares restantes

## Ver también

- [memory-bank/specific_gaps.md](../../../memory-bank/specific_gaps.md) — Gap 1, origen de este skill
- [.agents/rules/r01-api-contract-sync.md](../../rules/r01-api-contract-sync.md) — regla original que este skill operacionaliza
- [memory-bank/API_Reference.md](../../../memory-bank/API_Reference.md) — documentación actual (incompleta, 3/8 endpoints)
