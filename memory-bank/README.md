# Contexto del proyecto

Snapshot documental: 2026-10-02. Describe el estado que se observa en el código y configuración del repositorio. Las prioridades al final son sugerencias técnicas derivadas de gaps; no son compromisos ni roadmap de producto.

## 1. Overview del producto

El proyecto contiene un dashboard web de métricas financieras y una API. La pantalla muestra ingresos, egresos, beneficio y margen de beneficio, además de gráficos mensuales de ingresos/egresos y margen. El frontend obtiene movimientos de `GET /api/metrics`, calcula los indicadores en el cliente y los presenta en los componentes del dashboard. [App.tsx](../frontend/src/App.tsx) · [financial-utils.ts](../frontend/src/lib/financial-utils.ts) · [components/dashboard](../frontend/src/components/dashboard)

El backend entrega datos simulados: genera 30 movimientos por cada uno de 12 meses (360 en total) y usa la semilla `42` en las rutas. La asignación del año depende de la fecha actual; no representa una base de datos ni un intervalo móvil exacto de 12 meses. En `docker-compose.yml` no hay un servicio de base de datos declarado. [routes.py](../backend/app/routes.py) · [docker-compose.yml](../docker-compose.yml)

### Flujo observado

`frontend/src/App.tsx` → `GET /api/metrics` → proxy `/api` de Vite → `backend:8000` → movimientos simulados → cálculos y gráficos del frontend. `VITE_API_BASE_URL` permite configurar otro origen; vacía o no definida, la URL de la petición permanece relativa y usa el proxy. [App.tsx](../frontend/src/App.tsx) · [vite.config.ts](../frontend/vite.config.ts) · [.env.example](../frontend/.env.example)

El backend implementa `GET /health` y ocho rutas bajo `/api/metrics`: movimientos, facetas, resumen, categorías principales, comparación, alertas y segmentos B2B/B2C. La pantalla actual solo solicita `/api/metrics`; las demás rutas no están conectadas a `App.tsx`. [routes.py](../backend/app/routes.py) · [App.tsx](../frontend/src/App.tsx)

## 2. Stack tecnológico

Las versiones del frontend que incluyen `^` o `~` son rangos declarados en `package.json`, no afirmaciones de que esa versión exacta esté instalada. El backend no fija versiones en `requirements.txt`. [package.json](../frontend/package.json) · [requirements.txt](../backend/requirements.txt)

### Lenguajes

- TypeScript y JavaScript en la aplicación, configuración y pruebas frontend (`.ts`, `.tsx`, `vite.config.ts`).
- Python en la API y sus pruebas.
- HTML en `frontend/index.html`; CSS con Tailwind y variables de tema en `frontend/src/index.css`.

### Frameworks y librerías principales

- Frontend: React (`^19.2.4`), React DOM (`^19.2.4`), Vite (`^8.0.4`) y TypeScript (`~6.0.2`).
- Visualización y estilos: Recharts (`^3.8.1`), Tailwind CSS (`^4.2.2`) y `@tailwindcss/vite`.
- UI/utilidades: `lucide-react`, `class-variance-authority`, `clsx` y `tailwind-merge`.
- Backend: FastAPI, Pydantic para modelos/validación y Uvicorn como servidor ASGI; sus versiones no están fijadas en `requirements.txt`.
- Pruebas: Vitest (`^4.1.4`) en frontend; pytest y FastAPI `TestClient` en backend.

### Infraestructura y tooling

- `docker-compose.yml` define dos servicios: frontend en `5173` y backend en `8000`; también publica `5678` para `debugpy`.
- El frontend usa Node `24-alpine`, ejecuta Vite en modo desarrollo y monta el código como volumen. [frontend/Dockerfile](../frontend/Dockerfile)
- El backend usa Python `3.13-slim`; su comando ejecuta Uvicorn bajo `debugpy` y `--reload`. Es una configuración de desarrollo, no una configuración de producción declarada. [backend/Dockerfile](../backend/Dockerfile)
- `frontend/vite.config.ts` configura el proxy `/api` hacia `http://backend:8000` dentro de Compose y el alias de imports `@/`.
- Comando local documentado: `docker compose up --build`. Las URLs declaradas son `localhost:5173`, `localhost:8000` y `localhost:8000/docs`. [README.es.md](../README.es.md)

### Dependencias backend declaradas

`backend/requirements.txt` incluye `fastapi`, `uvicorn[standard]`, `debugpy`, `pytest`, `pytest-cov` y `httpx`, sin pins de versión. El Dockerfile instala la lista completa, incluidas las dependencias de prueba.

## 3. Estado actual

### Qué funciona

- El dashboard hace una carga inicial de `/api/metrics`, calcula KPIs y datos mensuales y presenta estados de carga/error y gráficos. [App.tsx](../frontend/src/App.tsx)
- Las rutas de métricas de FastAPI declaran modelos de respuesta y validan parámetros; `GET /health` es la excepción y devuelve un `dict`. `/docs` expone la documentación generada cuando la API está en ejecución. [routes.py](../backend/app/routes.py)
- Las pruebas existentes cubren las utilidades financieras y las rutas backend. En la última validación registrada: Vitest pasó 5/5 y pytest pasó 15/15. Pytest se ejecutó en un virtualenv temporal con dependencias instaladas desde `backend/requirements.txt` (sin pins; FastAPI 0.142.2, pytest 9.1.1 y httpx 0.28.1, entre otras); no equivale a probar la imagen Docker. Hubo una advertencia Starlette/httpx no bloqueante. [validacion_reglas.md](../validacion_reglas.md)
- El flujo navegador → Vite → API se comprobó localmente con upstream `127.0.0.1:8000` temporal y cargó el dashboard. El proxy original apunta a `backend:8000`; no se probó la red Docker Compose. El override de proxy y la allowlist CORS usados en probes fueron revertidos, así que no describen configuración persistente. [validacion_reglas.md](../validacion_reglas.md) · [vite.config.ts](../frontend/vite.config.ts) · [main.py](../backend/app/main.py)

### Gaps conocidos

- **Fechas en frontend:** `computeMonthlyData` convierte `YYYY-MM-DD` con `new Date(...)` y luego lee el mes en hora local. Se reprodujo que `2025-03-01` se agrupa en febrero en `America/Caracas`. La corrección se probó de forma temporal y se revirtió; el defecto sigue presente. [financial-utils.ts](../frontend/src/lib/financial-utils.ts) · [validacion_reglas.md](../validacion_reglas.md)
- **Periodo mostrado:** `App.tsx` pasa la etiqueta fija `2024 - Full Year`, y `DashboardHeader` también define un default fijo; las fechas simuladas dependen de `date.today()`. [App.tsx](../frontend/src/App.tsx) · [dashboard-header.tsx](../frontend/src/components/dashboard/dashboard-header.tsx) · [routes.py](../backend/app/routes.py)
- **Cobertura de integración:** hay pruebas de utilidades y endpoints, pero no pruebas frontend de `App.tsx` ni una suite que recorra navegador → Vite → API. [financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts) · [test_routes.py](../backend/tests/test_routes.py)
- **Readiness y reintentos:** Compose usa `depends_on` sin `healthcheck`; `App.tsx` hace una petición al montar y no reintenta cuando falla. [docker-compose.yml](../docker-compose.yml) · [App.tsx](../frontend/src/App.tsx)
- **CORS:** `backend/app/main.py` permite cualquier origen, métodos y cabeceras, además de credenciales. No es una política restringida para exposición externa. [main.py](../backend/app/main.py)
- **Despliegue y dependencias:** el Dockerfile backend ejecuta `debugpy` y `--reload`; no se encontró configuración de producción separada. Los requisitos backend no fijan versiones e incluyen paquetes de pruebas en la imagen. [backend/Dockerfile](../backend/Dockerfile) · [requirements.txt](../backend/requirements.txt)
- **Datos:** las rutas usan movimientos simulados y `random.seed(42)` reinicia el generador global; no se declara persistencia de datos en Compose. [routes.py](../backend/app/routes.py) · [docker-compose.yml](../docker-compose.yml)

### Siguientes prioridades sugeridas

No hay un roadmap de producto inferido aquí. Estas prioridades técnicas se derivan de los gaps anteriores y requieren confirmación antes de convertirse en trabajo comprometido:

1. Corregir y cubrir el desfase de fecha ISO (gap reproducido).
2. Derivar el periodo del encabezado de las fechas realmente recibidas para evitar mostrar 2024 cuando los datos corresponden a otro rango.
3. Añadir cobertura de integración para proxy/API y decidir el comportamiento deseado ante fallos iniciales (reintento, readiness o ambos).
4. Restringir CORS y definir una configuración de despliegue solo si el servicio va a exponerse fuera del entorno local.
5. Decidir si se fijan y separan dependencias backend para mejorar reproducibilidad o reducir la imagen; esto requiere una decisión de mantenimiento, no se asume como requisito.