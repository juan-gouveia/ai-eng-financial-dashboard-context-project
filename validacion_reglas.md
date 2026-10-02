# Validación de reglas

Bitácora de probes para `.agents/rules/`. No se crean commits ni se conservan cambios de código/configuración usados solo para probar las reglas. Los probes de fuentes se retiraron. Vite escribió artefactos ignorados en `frontend/dist`; esa carpeta ya existía al iniciar (el favicon tenía fecha previa), pero no se inventarió su contenido antes del build y se deja intacta para no borrar/alterar más datos a ciegas. El build adicional dirigido a `%TEMP%` tampoco se limpia por no haber comprobado si el directorio ya existía. El virtualenv temporal de Python, confirmado ausente al inicio, sí se eliminó.

## Entorno y baseline

- Baseline Git: árbol limpio antes de iniciar; no se detectaron cambios preexistentes.
- Node.js: `v22.23.1`; npm: `12.0.2`; `frontend/node_modules` ya existe.
- Frontend baseline: `npm --prefix frontend test` pasa (1 archivo, 5 tests). Vite muestra un aviso informativo sobre `configLoader: 'native'` y `__dirname`.
- Python: `3.12.10`; pytest y FastAPI no están instalados en el intérprete global.
- Docker Compose: no disponible (`docker` no está en PATH). Los probes de Compose se intentarán con servicios locales cuando sea equivalente; los que requieren Compose se marcarán parciales/bloqueados.
- Puertos `5173`, `8000`, `5678` y `4173`: libres al inicio.

## Resultados

| Regla | Tarea de validación | Resultado | Evidencia / notas |
|---|---|---|---|
| R-01 | Sincronizar temporalmente un valor de contrato entre Pydantic y TypeScript y validar. | PASS | Añadí `rules_probe` a `Category` en Pydantic y TypeScript y pruebas temporales por capa: Vitest 6/6; pytest focalizado 1 passed. Retiré los cambios; `git diff --exit-code` confirmó los cuatro archivos de código en baseline. |
| R-02 | Añadir un componente de dashboard temporal que use una función pura y compilar. | PASS | Integré un widget temporal en `App.tsx` que consumía `formatCurrency` desde `financial-utils`; `npm run build` pasó. Se retiró el widget y `App.tsx` volvió al baseline. Avisos no bloqueantes: configuración Vite con `__dirname` y bundle mayor a 500 kB. |
| R-03 | Enviar un parámetro fuera de rango y comprobar la respuesta de validación. | PASS | `GET /api/metrics/categories/top?limit=21` respondió 422 con error `less_than_equal` (`le: 20`) mediante FastAPI `TestClient`; sin cambios de código. |
| R-04 | Comprobar reproducibilidad de `random.Random` y aislamiento del estado global. | PASS | Test temporal en `backend/tests/`: 1 passed; dos instancias con semilla 42 repitieron secuencia y `random.getstate()` no cambió. Archivo retirado. |
| R-05 | Usar temporalmente `@/` en un import entre carpetas y compilar. | PASS | El probe R-02 compiló un widget temporal con `@/lib/financial-utils`; `kpi-row.tsx` ya combina import relativo al mismo directorio y alias hacia `src/lib`. Build pasó; no hizo falta probe adicional. |
| R-06 | Verificar en filesystem e imports las rutas/recursos declarados pero no usados. | PASS | `frontend/src/hooks/` no existe; `hero.png` y `mock-data.ts` sí existen, pero la búsqueda solo encontró la declaración `mockMovements`, sin consumidores en `frontend/src`. No cambié ni eliminé esos recursos. |
| R-07 | Añadir y ejecutar temporalmente un test en cada ubicación de prueba existente. | PASS | Vitest en `frontend/src/lib/rules-validation.test.ts`: 1 passed; pytest en `backend/tests/test_rules_validation.py`: 1 passed. Ambos archivos de prueba temporales fueron retirados. |
| R-08 | Probar navegador → Vite → API, o documentar el bloqueo de infraestructura. | PARTIAL | Con upstream temporal `127.0.0.1:8000`, `http://127.0.0.1:5173/api/metrics` devolvió 360 registros y el navegador cargó KPIs/gráficos. El proxy y la app funcionan; Docker ausente impide validar el hostname/red Compose original. |
| R-09 | Ejecutar suites frontend y backend disponibles. | PASS | Baselines completos: frontend 5/5 y backend 15/15. Backend se ejecutó con un virtualenv temporal en `%TEMP%`, no en Docker; una advertencia no bloqueante de Starlette/httpx apareció en pytest. |
| R-10 | Sincronizar una edición temporal entre los dos README y revertirla. | PASS | Añadí la misma instrucción en inglés/español y un check de presencia confirmó ambas. Retiré las dos líneas. |
| R-11 | Usar Compose o configurar explícitamente la URL del backend fuera de Compose. | PASS | `vite.config.ts` apunta a `backend:8000`, nombre de servicio Compose; fuera de Compose inicié Vite con `VITE_API_BASE_URL=http://127.0.0.1:8000` y el dashboard cargó en navegador. La red Compose no se pudo ejercitar sin Docker. |
| R-12 | Verificar el endpoint `/health` y la configuración de readiness de Compose. | PARTIAL | `GET /health` con FastAPI `TestClient` devolvió `200 {"status":"ok"}`. La configuración no declara `healthcheck` ni `condition: service_healthy`; no pude probar readiness real de Compose sin Docker. |
| R-13 | Ejercitar la carga inicial con API disponible/no disponible. | PASS | Con backend detenido, Vite devolvió 502 y la UI mostró el mensaje de error; al reiniciar backend y recargar, los KPIs reaparecieron y el error desapareció. La prueba fue local, no en Compose. |
| R-14 | Verificar que el comando de desarrollo/debug no se presenta como producción. | PASS | `backend/Dockerfile` usa `debugpy`, `--reload` y expone 5678; Compose monta el código y publica ese puerto. No hay una configuración de producción en el proyecto; sin cambios. |
| R-15 | Comprobar CORS con origen permitido y no permitido usando configuración temporal. | PASS | Con allowlist temporal `http://allowed.test`, TestClient devolvió ACAO para origen permitido, ninguno para origen bloqueado y preflight 200. Restauré la configuración; `git diff --exit-code -- backend/app/main.py` confirmó baseline. |
| R-16 | Revisar historial/diff de `package.json` y lockfile sin regenerarlos ni crear commits. | PASS | `git show 18ae052` confirma que solo cambió `frontend/package-lock.json`; el diff de `package.json` está vacío y ambos archivos siguen sin cambios locales. No ejecuté `npm install` ni creé commits. |
| R-17 | Revisar instalación/reproducibilidad de dependencias backend. | PARTIAL | `backend/requirements.txt` no fija versiones; instalé sus paquetes en `%TEMP%` y registré versiones resueltas (FastAPI 0.142.2, Uvicorn 0.54.0, pytest 9.1.1, entre otras). No pude probar el build de imagen ni comparar su tamaño sin Docker. |
| R-18 | Añadir temporalmente un token en ambos temas y verificar build/render. | PASS | Añadí valores distintos en `:root` y `.dark`; el navegador leyó `oklch(0.55 0.18 145)` y `oklch(0.75 0.15 145)`. `vite build` a `%TEMP%` pasó; token retirado y `index.css` volvió al baseline. |
| R-19 | Probar fecha del día 1 en zona al oeste de UTC con corrección temporal. | FAIL | En `America/Caracas`, el test temporal con `2025-03-01` esperaba `Mar 2025` y el baseline devolvió `Feb 2025`. El parseo temporal por prefijo ISO hizo pasar el test; retiré la corrección y el test, así que el defecto sigue presente. |
| R-20 | Derivar temporalmente el periodo mostrado de los datos y verificarlo. | PASS | Cambié temporalmente ambos valores fijos; el navegador mostró `2025-10-02 - 2026-09-28`, coincidente con min/max de `/api/metrics`; `tsc -b` pasó. Restauré `App.tsx` y `DashboardHeader` al baseline. |
| R-21 | Verificar semántica y cobertura de los datos simulados con fecha fija. | PASS | Test temporal fijando `today=2024-10-15` cubrió meses antes/durante/después del mes actual; combinado con el test existente de 360 registros ordenados: 2 passed. Test temporal retirado. |

## Cierre

Resultado: 17 PASS, 3 PARTIAL (R-08, R-12, R-17) y 1 FAIL (R-19, desfase ISO reproducible). Docker no está instalado, por lo que R-08 no cubrió la red Compose, R-12 no validó readiness del orquestador y R-17 no construyó la imagen.

Los procesos Vite/Uvicorn iniciados para la prueba se detuvieron; el target de `vite.config.ts`, CORS y los demás fuentes probados volvieron al baseline. No se crearon commits. El estado final esperado en Git es únicamente esta bitácora como archivo nuevo; `frontend/dist/` permanece como output ignorado y no se restauró por falta de un inventario inicial.