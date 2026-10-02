# Ruleset propuesto

Estas reglas se proponen para futuras contribuciones y agentes. Cada una incluye el hecho del proyecto que la motiva; todavía no están instaladas en `.agents/rules`.

## Arquitectura y contratos

### R-01. Mantener sincronizado el contrato API

Al cambiar un campo de respuesta o añadir consumo de un endpoint, actualizar los modelos Pydantic del backend, los tipos TypeScript del frontend y las pruebas afectadas (`backend/tests/test_routes.py` y `frontend/src/lib/financial-utils.test.ts`). Si cambian los valores admitidos de un `Literal` (`Category`, `OperationType`, `BusinessType`), actualizar también los union types equivalentes de `frontend/src/lib/financial-types.ts`, que están duplicados a mano.

**Hecho base:** `verification.md`, “Arquitectura y contratos”: el contrato API no está generado ni compartido; los modelos están en `backend/app/routes.py` y los tipos en `frontend/src/lib/financial-types.ts`. `create_date` se serializa como ISO `YYYY-MM-DD`.

### R-02. Separar presentación y cálculos

Ubicar los componentes específicos del dashboard en `frontend/src/components/dashboard/` y las piezas de UI reutilizables y genéricas en `frontend/src/components/ui/`. Mantener los cálculos y formateadores reutilizables como funciones puras en `frontend/src/lib/financial-utils.ts`; evitar mover lógica de dominio al render sin necesidad.

**Hecho base:** `verification.md`, “Arquitectura y contratos”: el dashboard y la UI reutilizable están separados, y los cálculos/formateadores se mantienen puros fuera de React.

### R-03. Validar entradas y respuestas del backend

En nuevos endpoints o al modificar los existentes, declarar el modelo de respuesta con `response_model` y validar los valores y parámetros con `Literal` y `Query`. Los endpoints nuevos no deben seguir la excepción de `/health`; `/health` puede conservarse como está. Cambiar defaults o límites de parámetros (`group_by="month"`, `limit` de 1 a 20 con valor 5, `threshold=0.3`, fechas obligatorias en `/comparison`) es un cambio de contrato y se trata como indica R-01.

**Hecho base:** `verification.md`, “Arquitectura y contratos”: las rutas usan modelos Pydantic, `response_model`, `Literal` y `Query`; `GET /health` es la excepción y devuelve un `dict`. “Detalles operativos y límites” documenta los defaults y límites actuales de la API.

### R-04. No usar el generador global de `random` en el backend

El código nuevo que necesite aleatoriedad debe usar una instancia propia, por ejemplo `random.Random(seed)`, en lugar de `random.seed()` y las funciones del módulo. Si se modifica `generate_mock_movements`, migrarla a ese patrón.

**Hecho base:** `verification.md`, “Arquitectura y contratos”: `generate_mock_movements` reinicia el generador global con `random.seed(42)` en cada petición; cualquier otro código del proceso que use `random` comparte ese estado.

## Naming e imports

### R-05. Respetar la convención local de imports

Usar imports relativos (`./`) solo entre módulos del mismo directorio y el alias `@/` cuando el import cruza a otro directorio de `src`. No convertir imports de forma masiva solo para imponer un estilo único.

**Hecho base:** `verification.md`, “Naming e imports”: el código mezcla ambos estilos siguiendo ese criterio; `kpi-row.tsx` importa `./kpi-card`, `main.tsx` importa `./App.tsx` y los módulos de `src/lib` se importan entre sí con `./`, mientras que `App.tsx` y los componentes usan `@/` para cruzar directorios.

### R-06. No asumir que alias o recursos declarados están implementados o en uso

Antes de depender de un alias o recurso, comprobar que la ruta existe y que participa en el flujo activo. Tampoco eliminar estos alias o recursos sin uso sin confirmarlo antes.

**Hecho base:** `verification.md`, “Naming e imports”: `frontend/components.json` declara `@/hooks` aunque `frontend/src/hooks/` no existe; `hero.png` y `mockMovements` no se usan en el frontend.

## Testing

### R-07. Añadir pruebas en las ubicaciones existentes

Cubrir cálculos frontend con Vitest en `frontend/src/lib/*.test.ts` y endpoints backend con pytest y `TestClient` en `backend/tests/`. Hoy no hay herramientas para probar componentes React (no hay `jsdom` ni Testing Library); añadirlas implica dependencias nuevas y se trata como indica R-16.

**Hecho base:** `verification.md`, “Testing”: ese es el patrón de pruebas existente; `npx vitest run` ejecutó un archivo con cinco tests en verde.

### R-08. Probar las integraciones afectadas

Si un cambio afecta la carga inicial, el proxy, la configuración de ejecución o la comunicación entre frontend y backend, comprobar el flujo navegador → proxy de Vite → API; las pruebas unitarias de utilidades y las pruebas backend no cubren por sí solas ese recorrido. Comprobación mínima: con `docker compose up`, solicitar `http://localhost:5173/api/metrics` (pasa por el proxy) y confirmar que el dashboard carga los KPIs sin mostrar el mensaje de error.

**Hecho base:** `verification.md`, “Testing”: no hay cobertura integrada del flujo navegador → proxy → API, ni tests frontend de `App.tsx` para carga, error o `fetch`.

### R-09. Ejecutar las pruebas antes de dar un cambio por terminado

Ejecutar `npx vitest run` en `frontend/` y `docker compose exec backend pytest` para el backend. pytest no está instalado en el Python local, por lo que las pruebas backend se ejecutan en el contenedor.

**Hecho base:** `verification.md`, “Testing”: `npx vitest run` se ejecutó con cinco tests en verde; pytest no está disponible en el Python local y las pruebas backend no se ejecutaron en la revisión.

## Documentación

### R-10. Mantener sincronizadas las instrucciones en ambos idiomas

Al cambiar el arranque, la configuración local o la interfaz pública de la API, actualizar `README.md` y `README.es.md` en el mismo cambio.

**Hecho base:** `verification.md`, “Documentación”: las instrucciones existen en dos README; un cambio en uno solo puede dejar el otro desactualizado. Hoy ambos están alineados.

### R-11. Consultar la especificación publicada por FastAPI

Usar `/docs` como referencia de rutas y parámetros implementados. `/docs` solo está disponible con el backend en ejecución (`http://localhost:8000/docs`).

**Hecho base:** `verification.md`, “Documentación”: FastAPI publica `/docs` con las rutas y parámetros actuales.

## DX y ejecución

### R-12. Usar el entorno de ejecución compatible con la configuración

Para desarrollo local, usar Docker Compose; si Vite corre fuera de Compose, definir `VITE_API_BASE_URL` con un origen accesible, por ejemplo `http://localhost:8000`. Esta alternativa funciona porque CORS está abierto; si se aplica R-15, incluir `http://localhost:5173` entre los orígenes permitidos.

**Hecho base:** `verification.md`, “DX y ejecución”: el proxy de Vite apunta al hostname `backend`, disponible en la red de Compose; fuera de ella se documenta la variable `VITE_API_BASE_URL`.

### R-13. Tratar readiness y errores de carga al modificar el arranque

Si se cambia el orden de inicio o la carga inicial, tener en cuenta que `depends_on` no espera a que la API esté lista y que la pantalla no reintenta una petición fallida. Si se añade un `healthcheck`, usar el endpoint `/health` existente con `depends_on: condition: service_healthy`; como la imagen `python:3.13-slim` no incluye `curl`, la comprobación puede hacerse con `python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"`.

**Hecho base:** `verification.md`, “DX y ejecución”: Compose no configura `healthcheck`; `App.tsx` hace una única petición al montar y deja el mensaje de error hasta recargar.

### R-14. No usar el arranque con `debugpy` como configuración de producción

No reutilizar el `CMD` de `backend/Dockerfile` para despliegues ni exponer el puerto `5678` fuera del entorno local.

**Hecho base:** `verification.md`, “DX y ejecución”: el backend arranca Uvicorn bajo `debugpy` con recarga automática; ese modo no describe una configuración de producción.

## Seguridad y dependencias

### R-15. Limitar CORS para entornos no locales

Antes de exponer el backend fuera del entorno local, sustituir la política abierta por orígenes explícitamente autorizados y revisar el uso de credenciales. Mantener `http://localhost:5173` si se sigue usando el flujo de R-12.

**Hecho base:** `verification.md`, “Arquitectura y contratos”: `main.py` permite cualquier origen con credenciales (`allow_origins=["*"]`, `allow_credentials=True`).

### R-16. Revisar cambios de dependencias y lockfiles

Al cambiar dependencias frontend, revisar el diff de `package-lock.json` junto con `package.json`. No incluir regeneraciones del lockfile ajenas al cambio; si son necesarias, hacerlas en un commit aparte. Para el backend, considerar el impacto de versiones sin fijar y de instalar dependencias de pruebas en la imagen.

**Hecho base:** `verification.md`, “Dependencias y estilos”: el lockfile cambió en el commit `18ae052` sin cambios en `package.json`; el backend no fija versiones y su imagen instala dependencias de pruebas.

## Estilos

### R-17. Reutilizar los tokens visuales existentes

Al añadir o modificar estilos del dashboard, preferir tokens de `frontend/src/index.css` y las clases Tailwind existentes antes de introducir valores de color nuevos. Si se crea un token, definirlo tanto en `:root` como en `.dark`.

**Hecho base:** `verification.md`, “Dependencias y estilos”: los componentes ya usan variables de tema y clases Tailwind, sin colores hex ni paletas Tailwind fijas en `src/components`. `index.css` define cada token en `:root` y en `.dark`.

## Datos y fechas

### R-18. Tratar las fechas ISO sin desfase de zona horaria

No convertir fechas `YYYY-MM-DD` con `new Date(...)` para agruparlas por mes o día, porque se interpretan en UTC y luego se leen en hora local. Extraer año, mes y día directamente del texto ISO, o construir la fecha con `new Date(year, month - 1, day)`. Al tocar `computeMonthlyData`, añadir una prueba con un movimiento del día 1.

**Hecho base:** `verification.md`, “Detalles operativos y límites”: `computeMonthlyData` usa `new Date("YYYY-MM-DD")` y `getMonth()`; en zonas horarias al oeste de UTC, una fecha del primer día puede agruparse en el mes anterior.

### R-19. No fijar en la interfaz periodos que dependen de los datos

Derivar las etiquetas de periodo de los datos recibidos (fechas mínima y máxima de los movimientos o `/api/metrics/facets`) en lugar de escribirlas en el código.

**Hecho base:** `verification.md`, “Detalles operativos y límites”: el encabezado está fijado en `2024 - Full Year`, mientras que el backend calcula el año de los movimientos a partir de `date.today()`.

### R-20. Mantener explícita la semántica de los datos simulados

No asumir que los datos simulados cubren un intervalo móvil de 12 meses hasta hoy: los meses anteriores al actual se asignan al año en curso y el mes actual y los siguientes al año anterior, por lo que el mes en curso nunca aparece con el año actual. Si se cambia `generate_mock_movements` (semilla, número de movimientos, asignación de años), actualizar `backend/tests/test_routes.py` y `verification.md`.

**Hecho base:** `verification.md`, “Detalles operativos y límites”: cada petición genera 360 movimientos (12 meses × 30) con semilla `42`, y los años dependen del mes actual.
