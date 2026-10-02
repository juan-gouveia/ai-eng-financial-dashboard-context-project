# Ruleset propuesto

Estas reglas guían las contribuciones y el trabajo de agentes en el proyecto. Están instaladas en `.agents/rules`, un archivo por regla; este documento las resume. Cada una incluye el hecho del código que la motiva y, cuando el código actual no la cumple, su estado.

## Arquitectura y contratos

### R-01. Mantener sincronizado el contrato API (`r01-api-contract-sync.md`)

Al cambiar un campo de respuesta o añadir consumo de un endpoint, actualizar los modelos Pydantic del backend, los tipos TypeScript del frontend y las pruebas afectadas (`backend/tests/test_routes.py` y `frontend/src/lib/financial-utils.test.ts`). Si cambian los valores admitidos de `Category`, `OperationType` o `BusinessType`, actualizar también los union types equivalentes. Conservar el formato ISO `YYYY-MM-DD` de `create_date`.

**Hecho base:** `backend/app/routes.py` define los modelos Pydantic y los `Literal`; `frontend/src/lib/financial-types.ts` los repite a mano, sin generación ni paquete compartido. `create_date` es `date` en Pydantic y `string` en TypeScript; coinciden porque FastAPI lo serializa como `YYYY-MM-DD`.

### R-02. Separar presentación y cálculos (`r02-frontend-architecture.md`)

Ubicar los componentes específicos del dashboard en `frontend/src/components/dashboard/` y las piezas de UI genéricas en `frontend/src/components/ui/`. Mantener los cálculos y formateadores reutilizables como funciones puras en `frontend/src/lib/financial-utils.ts`, fuera del render de React.

**Hecho base:** `components/dashboard/` contiene KPIs, gráficos y cabecera; `components/ui/` contiene `card.tsx` y `skeleton.tsx`. `computeKPIs`, `computeMonthlyData`, `formatCurrency` y `formatPercent` son funciones puras que `App.tsx` y los componentes solo invocan.

### R-03. Validar entradas y respuestas del backend (`r03-backend-api-validation.md`)

En nuevos endpoints o al modificar los existentes, declarar `response_model` y validar valores y parámetros con `Literal` y `Query`. Los endpoints nuevos no deben seguir la excepción de `/health`; `/health` puede conservarse como está. Cambiar defaults o límites de parámetros (`group_by`, `limit`, `threshold`, fechas obligatorias en `/comparison`) es un cambio de contrato y se trata como indica `r01-api-contract-sync.md`. Para comprobar rutas y parámetros publicados, consultar `http://localhost:8000/docs` con el backend en ejecución.

**Hecho base:** en `backend/app/routes.py`, todos los endpoints salvo `health()` declaran `response_model`; los valores se limitan con `Literal` y los parámetros con `Query` (por ejemplo, `limit` con `ge=1, le=20` y `threshold` con `ge=0`). `health()` devuelve un `dict`.

### R-04. Evitar el generador global de `random` (`r04-local-random-generator.md`)

El código nuevo que necesite aleatoriedad debe usar una instancia propia, por ejemplo `random.Random(seed)`, en lugar de `random.seed()` y las funciones del módulo. Migrar `generate_mock_movements` a `random.Random(42)` no cambia los datos, porque produce la misma secuencia.

**Hecho base:** `generate_mock_movements` llama a `random.seed(seed)` y usa las funciones globales del módulo; todos los endpoints la invocan con `seed=42`, así que cada petición reinicia el generador global del proceso.

**Estado actual:** `generate_mock_movements` no cumple esta regla. Se corrige solo si la tarea lo pide; en otro caso, preguntar antes.

## Naming e imports

### R-05. Respetar la convención local de imports (`r05-frontend-imports.md`)

Usar imports relativos (`./`) solo entre módulos del mismo directorio y el alias `@/` al cruzar a otro directorio de `src`. No convertir imports de forma masiva para imponer un estilo único.

**Hecho base:** en `frontend/src/`, los imports relativos existentes enlazan siempre módulos del mismo directorio, y los que cruzan directorios usan `@/`, definido en `frontend/vite.config.ts` y `frontend/tsconfig.app.json`.

### R-06. Verificar alias y recursos antes de usarlos (`r06-verify-aliases-and-assets.md`)

Antes de depender de un alias o recurso, comprobar que la ruta existe y que participa en el flujo activo. No eliminar aliases ni recursos sin uso sin preguntar antes, aunque no se encuentren consumidores.

**Hecho base:** `frontend/components.json` declara `"hooks": "@/hooks"`, pero `frontend/src/hooks/` no existe. `frontend/src/assets/hero.png` y `mockMovements` no se importan en ningún archivo de `frontend/src`.

## Testing

### R-07. Añadir pruebas en las ubicaciones existentes (`r07-test-locations.md`)

Cubrir cálculos frontend con Vitest junto a las utilidades y endpoints backend con pytest y `TestClient` en `backend/tests/`. No hay herramientas para probar componentes React; añadirlas implica dependencias nuevas y se trata como indica `r16-frontend-dependencies.md`.

**Hecho base:** la única prueba frontend es `frontend/src/lib/financial-utils.test.ts`; las pruebas backend están en `backend/tests/test_routes.py` y usan `TestClient`. `frontend/package.json` no incluye `jsdom` ni Testing Library.

### R-08. Probar las integraciones afectadas (`r08-integration-coverage.md`)

Si un cambio afecta la carga inicial, el proxy, la configuración de ejecución o la comunicación entre frontend y backend, comprobar con Docker Compose en ejecución:

1. de forma automatizable, que `curl -sf http://localhost:5173/api/metrics` termina sin error y devuelve un array JSON;
2. de forma visual, que el dashboard en `http://localhost:5173` muestra los KPIs sin el mensaje de error.

Si alguna comprobación no se puede hacer, indicarlo explícitamente y no darla por superada.

**Hecho base:** `App.tsx` hace `fetch` a `${API_BASE_URL}/api/metrics` y `vite.config.ts` redirige `/api` a `http://backend:8000`. Ninguna prueba recorre ese camino: Vitest solo prueba `financial-utils.ts` y `TestClient` llama a la API sin pasar por Vite.

### R-09. Ejecutar las pruebas pertinentes (`r09-run-tests.md`)

Ejecutar `npm test` desde `frontend/` (no `npx vitest run`, que descarga otra versión si faltan dependencias; si falta `node_modules`, instalar con `npm ci`). Para el backend, ejecutar `docker compose exec backend pytest` si los servicios están levantados, sin levantarlos ni reconstruirlos solo para esto sin avisar. Indicar qué pruebas no se pudieron ejecutar y no presentar un resultado no verificado como exitoso.

**Hecho base:** `frontend/package.json` define `"test": "vitest run"`. `backend/requirements.txt` incluye `pytest` y `backend/Dockerfile` lo instala en la imagen.

## Documentación

### R-10. Mantener sincronizados los README bilingües (`r10-bilingual-readmes.md`)

Al cambiar el arranque, la configuración local, los puertos o las URLs, actualizar `README.md` y `README.es.md` en el mismo cambio. Esta regla no exige documentar endpoints en los README; la referencia de la API es `/docs`.

**Hecho base:** ambos README contienen las mismas instrucciones de ejecución local (`docker compose up --build`, puertos `5173` y `8000`, `/docs` y `frontend/.env.example`); ninguno documenta endpoints.

## DX y ejecución

### R-11. Usar el entorno compatible con la configuración local (`r11-local-development.md`)

Usar Docker Compose para el flujo local predeterminado. Si Vite corre fuera de Compose, definir `VITE_API_BASE_URL` con un origen accesible, normalmente `http://localhost:8000`. Esta alternativa depende de la política CORS; ver `r15-cors-policy.md`.

**Hecho base:** `vite.config.ts` redirige `/api` a `http://backend:8000`, nombre del servicio en `docker-compose.yml` que solo resuelve dentro de la red de Compose. `App.tsx` antepone `VITE_API_BASE_URL ?? ""` a las peticiones.

### R-12. Considerar readiness al modificar el arranque de Compose (`r12-compose-readiness.md`)

Tener en cuenta que `depends_on` solo ordena el arranque. Si se añade un `healthcheck`, usar `/health` con `depends_on: condition: service_healthy`; como `python:3.13-slim` no incluye `curl`, la comprobación puede hacerse con `python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"`.

**Hecho base:** en `docker-compose.yml`, `frontend` declara `depends_on: backend` sin `healthcheck`. `backend/app/routes.py` ya expone `GET /health`.

### R-13. Tratar los fallos de la carga inicial del dashboard (`r13-frontend-initial-load.md`)

Al cambiar la carga inicial, tener en cuenta que hoy un fallo no se reintenta. Cualquier reintento o recarga debe mantener coherentes los estados `loading` y `error` que reciben `KPIRow`, `IncomeOutcomeChart` y `ProfitPercentChart`.

**Hecho base:** el `useEffect` de `App.tsx` llama una sola vez a `fetchFinancialData`; en el `catch` fija el mensaje de error y no reintenta, así que un fallo inicial queda visible hasta recargar la página.

### R-14. No usar el arranque de desarrollo en producción (`r14-development-server-only.md`)

No reutilizar el `CMD` de `backend/Dockerfile` para despliegues ni exponer el puerto `5678` de `debugpy` fuera del entorno local. Tratar cualquier despliegue como una configuración aparte y explícita.

**Hecho base:** el `CMD` de `backend/Dockerfile` arranca Uvicorn bajo `debugpy` con `--reload`, y `docker-compose.yml` publica el puerto `5678` y monta `./backend` como volumen.

## Seguridad y dependencias

### R-15. Limitar CORS fuera del entorno local (`r15-cors-policy.md`)

Antes de exponer el backend fuera del entorno local, sustituir `allow_origins=["*"]` por orígenes autorizados explícitos y revisar `allow_credentials`. Si se mantiene el flujo de `r11-local-development.md`, incluir `http://localhost:5173` entre los orígenes permitidos. El flujo con el proxy de Vite no depende de CORS.

**Hecho base:** `backend/app/main.py` configura `CORSMiddleware` con `allow_origins=["*"]`, `allow_credentials=True` y métodos y cabeceras `*`.

### R-16. Revisar dependencias y lockfile del frontend (`r16-frontend-dependencies.md`)

Al cambiar dependencias, revisar el diff de `package-lock.json` junto con `package.json`. No incluir regeneraciones del lockfile ajenas al cambio; si son necesarias, hacerlas en un commit aparte. Para instalar sin modificar el lockfile, usar `npm ci`.

**Hecho base:** `frontend/package.json` declara versiones con rangos (`^`, `~`), por lo que `npm install` puede reescribir el lockfile sin cambios en `package.json`; ocurrió en el commit `18ae052`. `frontend/Dockerfile` también ejecuta `npm install`.

### R-17. Revisar dependencias del backend (`r17-backend-dependencies.md`)

Al añadir o cambiar dependencias, tener en cuenta que reconstruir la imagen puede traer versiones nuevas de cualquier paquete. Considerar fijar versiones y separar dependencias de ejecución y de prueba si el cambio afecta a la reproducibilidad o al tamaño de la imagen.

**Hecho base:** `backend/requirements.txt` lista los paquetes sin versión y `backend/Dockerfile` instala el archivo completo, incluidas las dependencias de prueba.

## Estilos

### R-18. Reutilizar los tokens visuales existentes (`r18-frontend-theme.md`)

Antes de introducir colores nuevos, reutilizar los tokens de `frontend/src/index.css` y las clases Tailwind existentes. Si se crea un token, definirlo en `:root` y en `.dark`.

**Hecho base:** `index.css` define los tokens de tema en `:root` y `.dark`; los componentes de `components/dashboard/` los usan con `var(--...)` y no contienen colores hex ni paletas Tailwind fijas.

## Datos y fechas

### R-19. Evitar desfases al manejar fechas ISO (`r19-iso-date-handling.md`)

No usar `new Date(isoDate)` para agrupar fechas `YYYY-MM-DD` por día o mes; extraer las partes del texto ISO o construir la fecha con `new Date(year, month - 1, day)`. Al modificar `computeMonthlyData`, añadir una prueba con un movimiento del día 1 en un archivo propio que fije `process.env.TZ = "America/Caracas"` antes de crear fechas; sin ella la prueba pasa en UTC o al este aunque el error exista, y pasar `TZ=` por línea de comandos no tiene efecto en Git Bash de Windows.

**Hecho base:** `computeMonthlyData` hace `new Date(m.create_date)` y `toYearMonthKey` lee `getFullYear()` y `getMonth()`. Con la zona `America/Caracas`, `2025-03-01` se agrupa en febrero (comprobado con Vitest).

**Estado actual:** `computeMonthlyData` no cumple esta regla. Se corrige solo si la tarea lo pide; en otro caso, preguntar antes.

### R-20. Derivar periodos visibles de los datos (`r20-data-driven-period-labels.md`)

Derivar las etiquetas de periodo de las fechas de los movimientos o de `/api/metrics/facets` en lugar de codificar un año. Al corregirlo, sustituir los dos valores fijos: la prop en `App.tsx` y el valor por defecto de `DashboardHeader`.

**Hecho base:** `App.tsx` pasa `period="2024 - Full Year"` a `DashboardHeader`, que además define su propio valor por defecto `'2024 — Full Year'`. En el backend, `_year_for_month` calcula el año a partir de `date.today()`.

**Estado actual:** `App.tsx` y `dashboard-header.tsx` no cumplen esta regla. Se corrigen solo si la tarea lo pide; en otro caso, preguntar antes.

### R-21. Mantener explícita la semántica de los datos simulados (`r21-mock-data-semantics.md`)

No describir los datos simulados como un intervalo móvil exacto de 12 meses: el mes en curso nunca aparece con el año actual. Si se cambia la semilla, la cantidad de movimientos o la asignación de años, actualizar `backend/tests/test_routes.py`; para cubrir la asignación de años, probar `_year_for_month` pasándole una fecha `today` fija.

**Hecho base:** `generate_mock_movements` genera 30 movimientos por mes durante 12 meses (360), y `_year_for_month` asigna el año actual a los meses anteriores al actual y el año anterior al resto. `test_generate_mock_movements_returns_full_year_sorted_data` solo comprueba la cantidad y el orden, no los años.
