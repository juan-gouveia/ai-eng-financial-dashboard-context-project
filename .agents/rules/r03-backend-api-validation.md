# R-03: Validar entradas y respuestas del backend

**Alcance:** Endpoints, modelos de respuesta y parámetros de consulta en `backend/app/routes.py`.
**Justificación:** En `backend/app/routes.py`, todos los endpoints salvo `health()` declaran `response_model`; los valores admitidos se limitan con `Literal` (`Category`, `OperationType`, `BusinessType`, `GroupBy`) y los parámetros con `Query` (por ejemplo, `limit` con `ge=1, le=20` y `threshold` con `ge=0`). `health()` devuelve un `dict` sin `response_model`.

## Guía específica del proyecto

En endpoints nuevos o modificados declara `response_model` y valida opciones y parámetros con `Literal` y `Query`. Los endpoints nuevos no deben seguir la excepción de `/health`; `/health` puede conservarse como está. Trata cambios en defaults y límites (`group_by`, `limit`, `threshold`, fechas requeridas) como cambios del contrato y aplica `r01-api-contract-sync.md`.

Para comprobar las rutas y parámetros publicados, consulta `http://localhost:8000/docs` con el backend en ejecución; no es documentación estática disponible sin la API levantada.
