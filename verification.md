# Mapeo y resumen del proyecto

## Mapeo de estructura

- `frontend/`: aplicación web en React, TypeScript y Vite. ✅
	- `frontend/index.html`: documento HTML con el elemento raíz `root` y carga de `src/main.tsx`. ✅
	- `frontend/src/main.tsx`: crea el root de React, importa los estilos globales y monta `App`. ✅
	- `frontend/src/App.tsx`: obtiene los movimientos de la API, gestiona carga y error, calcula métricas y organiza el dashboard. ✅
	- `frontend/src/components/dashboard/`: cabecera, KPIs y gráficos (`dashboard-header.tsx`, `kpi-row.tsx`, `kpi-card.tsx`, `income-outcome-chart.tsx`, `profit-percent-chart.tsx`). ✅
	- `frontend/src/components/ui/`: componentes reutilizables `card.tsx` y `skeleton.tsx`. ✅
	- `frontend/src/lib/`: tipos (`financial-types.ts`), cálculos y formato (`financial-utils.ts`), datos de ejemplo (`mock-data.ts`) y utilidades (`utils.ts`). ✅
	- `frontend/src/lib/financial-utils.test.ts`: pruebas de los cálculos del frontend. ✅
	<!-- Nota: cubre computeKPIs, computeMonthlyData y los formateadores (formatCurrency/formatPercent) con Vitest. -->
	- `frontend/package.json`: dependencias y scripts de desarrollo, build, lint y pruebas. ✅
	- `frontend/package-lock.json`: lockfile de dependencias npm. ✅
	<!-- Nota: actualmente tiene cambios locales sin commitear (staged) tras el npm install: vite 8.0.8 → 8.3.2, postcss 8.5.9 → 8.5.28, rolldown rc.15 → 1.2.12, entre otros. -->
	<!-- Nota: el comentario siguiente ("también incluye los scripts...") se refiere a `frontend/package.json` (dos viñetas más arriba), no al lockfile. -->
	<!-- Nota: también incluye los scripts preview, test:watch y test:coverage. -->
	- `frontend/vite.config.ts`: configuración de Vite, alias `@` y proxy de `/api`. ✅
	- `frontend/eslint.config.js`: reglas de ESLint para TypeScript, React Hooks y React Refresh. ✅
	- `frontend/tsconfig.json`, `frontend/tsconfig.app.json` y `frontend/tsconfig.node.json`: configuración TypeScript para la app y la configuración de Vite. ✅
	<!-- Nota: tsconfig.json solo referencia a los otros dos; tsconfig.app.json incluye src/ y tsconfig.node.json incluye vite.config.ts. Los tipos `vite/client` y `node` requieren node_modules instalado localmente para que el editor no marque errores. -->
	- `frontend/components.json`: configuración de componentes y alias de shadcn/ui. ✅
	<!-- Nota: declara el alias `hooks` → `@/hooks`, pero esa carpeta no existe. -->
	- `frontend/src/index.css`: estilos globales, tokens de tema y variantes clara/oscura; `App.tsx` aplica la clase `dark` al dashboard. ✅
	- `frontend/public/favicon.svg`: favicon referenciado por `frontend/index.html`. ✅
	- `frontend/src/assets/hero.png`: recurso presente en el árbol, sin importación encontrada en `frontend/src`. ✅
	- `frontend/Dockerfile`: imagen y comando de desarrollo del frontend. ✅
	- `frontend/.env.example`: variable opcional `VITE_API_BASE_URL` para cambiar el origen de la API. ✅
- `backend/`: API en Python con FastAPI. ✅
	- `backend/app/main.py`: instancia FastAPI, configura CORS e incluye el router. ✅
	- `backend/app/routes.py`: modelos, generación de movimientos simulados, filtros, cálculos y endpoints. ✅
	- `backend/tests/`: pruebas de rutas y comportamiento (`test_routes.py`) y configuración de importación (`conftest.py`). ✅
	- `backend/requirements.txt`: dependencias Python. ✅
	- `backend/Dockerfile`: imagen y comando de arranque de Uvicorn con recarga y `debugpy`. ✅
- `docker-compose.yml`: define los servicios `frontend` y `backend`, puertos, volúmenes y dependencia de arranque. ✅
- `README.es.md` y `README.md`: instrucciones del proyecto y ejecución local en español e inglés. ✅
- `AGENTS.md`: indica revisar `.agents/rules`, `.agents/skills` y `memory-bank` antes de trabajar; en esta revisión las dos primeras carpetas no existen y `memory-bank/` está vacío. ✅
<!-- Nota: memory-bank/ existe solo en local; al estar vacío, git no lo rastrea y no aparecerá en un clon del repositorio. -->

## Servicios y conexión

`docker-compose.yml` levanta dos servicios: ✅

- `frontend`: sirve Vite en el puerto `5173`. ✅
- `backend`: sirve FastAPI/Uvicorn en el puerto `8000`; también expone `5678` para `debugpy`. ✅

En desarrollo, el navegador carga el frontend en `http://localhost:5173`. `frontend/vite.config.ts` reenvía las solicitudes cuyo path empieza por `/api` a `http://backend:8000`, usando el nombre del servicio de Compose. `frontend/src/App.tsx` usa `VITE_API_BASE_URL` si está definida; de lo contrario solicita `GET /api/metrics` mediante ese proxy. ✅

El backend genera movimientos financieros simulados con semilla `42` y los entrega desde sus endpoints. No hay un servicio de base de datos definido en `docker-compose.yml`. La pantalla actual consume `/api/metrics`; las demás rutas listadas abajo están implementadas en el backend, pero no se solicitan desde `App.tsx`. ✅

## Entry points y API

- Frontend: `frontend/index.html` → `frontend/src/main.tsx` → `frontend/src/App.tsx`. ✅
- Backend: el comando del contenedor ejecuta `uvicorn app.main:app`; `backend/app/main.py` incorpora las rutas de `backend/app/routes.py`. ✅
- `GET /health`: comprobación de estado. ✅
- `GET /api/metrics`: movimientos; admite filtros por fecha, categoría y tipo de operación. ✅
- `GET /api/metrics/facets`: opciones de filtros y rango de fechas. ✅
- `GET /api/metrics/summary`: agregados por día, semana o mes; admite filtros. ✅
- `GET /api/metrics/categories/top`: categorías principales por tipo de operación. ✅
- `GET /api/metrics/comparison`: comparación de valor neto entre dos periodos. ✅
- `GET /api/metrics/alerts`: alertas por incremento de egresos. ✅
- `GET /api/metrics/b2b` y `GET /api/metrics/b2c`: movimientos filtrados por tipo de negocio. ✅

La API genera documentación interactiva en `/docs` (FastAPI). Los tipos de movimiento usados por frontend están en `frontend/src/lib/financial-types.ts` y los modelos de respuesta del backend en `backend/app/routes.py`. ✅

## Resumen del proyecto

### ¿Qué hace?

Presenta un dashboard de métricas financieras: ingresos, egresos, beneficio y porcentaje de beneficio, además de gráficos mensuales de ingresos/egresos y porcentaje. El backend proporciona datos simulados; no se observa una conexión a almacenamiento persistente en los archivos de ejecución revisados. ✅

### ¿Cómo se conecta?

`App.tsx` solicita los movimientos a `GET /api/metrics`. El proxy de Vite los dirige al backend de Compose (`backend:8000`). El cliente calcula KPIs y datos mensuales con `computeKPIs` y `computeMonthlyData`, definidos en `frontend/src/lib/financial-utils.ts`, y los presenta mediante los componentes del dashboard. FastAPI incorpora las rutas desde `backend/app/routes.py` y permite CORS. ✅

### ¿Cómo se ejecuta?

Desde la raíz del repositorio, el README documenta: ✅

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173` ✅
- Backend: `http://localhost:8000` ✅
- Documentación de la API: `http://localhost:8000/docs` ✅

El proxy cubre la conexión local por defecto. Para apuntar a otro origen, `frontend/.env.example` documenta `VITE_API_BASE_URL`. ✅

## Detalles operativos y límites

- La etiqueta del encabezado del dashboard está fijada en `2024 - Full Year`, mientras que el backend determina el año de los movimientos a partir de `date.today()`. No representa necesariamente el periodo mostrado por los datos. ✅
- Cada petición genera 360 movimientos simulados (12 meses × 30). La semilla `42` repite la secuencia de valores, pero los años dependen del mes actual: los meses anteriores al actual se asignan al año actual y el mes actual y los siguientes al año anterior. No es un intervalo móvil exacto desde el día de hoy. ✅
<!-- Nota: en consecuencia, el mes en curso del año actual nunca aparece en los datos: siempre se genera como el mismo mes del año anterior. -->
- `generate_mock_movements` llama a `random.seed(42)`, que reinicia el generador global del módulo `random` de Python en cada petición; cualquier otro código del proceso que use `random` queda afectado. ✅
- `frontend/src/lib/mock-data.ts` exporta `mockMovements`, pero no se encontró ningún import de esa exportación en `frontend/src`; el dashboard usa los datos de la API. ✅
- `frontend/src/lib/utils.ts` solo exporta `cn()`, que combina `clsx` y `tailwind-merge` para componer clases de Tailwind. ✅
- El proxy apunta a `backend:8000`, nombre resoluble en la red de Docker Compose. Si Vite se ejecuta fuera de Compose, ese host no está garantizado; habría que definir `VITE_API_BASE_URL` con un origen accesible o ajustar el proxy. ✅
- `App.tsx` construye la URL con `VITE_API_BASE_URL ?? ""`: si la variable existe pero está vacía (como en `frontend/.env.example`), las peticiones siguen siendo relativas y pasan por el proxy. ✅
- `backend/app/main.py` habilita CORS para cualquier origen y también `allow_credentials=True`; conviene revisar esa política antes de exponer la API fuera del entorno local. ✅
- `computeMonthlyData` crea fechas con `new Date("YYYY-MM-DD")` y luego consulta `getMonth()` en hora local. En zonas horarias al oeste de UTC, una fecha del primer día puede agruparse en el mes anterior. ✅
- El backend no fija versiones en `backend/requirements.txt`; las dependencias de pruebas también se instalan en la imagen definida por `backend/Dockerfile`. ✅
- El contenedor del backend no lanza Uvicorn directamente: el `CMD` es `python -m debugpy --listen 0.0.0.0:5678 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`, así que Uvicorn corre bajo `debugpy` (puerto `5678`) y con recarga automática. ✅
- Para la API, `/api/metrics/summary` agrupa por mes de forma predeterminada; `/api/metrics/categories/top` usa `outcome` y límite `5` por defecto (límite permitido de 1 a 20); `/api/metrics/comparison` requiere fechas de inicio y fin; `/api/metrics/alerts` usa un umbral de `0.3` y compara cada periodo con el promedio de los anteriores. ✅
- Filtros adicionales de la API: `/api/metrics/summary` acepta `start_date`, `end_date`, `category`, `operation_type` y `business_type`; `/api/metrics/categories/top` y `/api/metrics/alerts` aceptan `start_date`, `end_date` y `business_type`. ✅
- `/api/metrics/comparison` calcula automáticamente el periodo previo: misma duración que el rango solicitado, terminando el día anterior a `start_date`. ✅
