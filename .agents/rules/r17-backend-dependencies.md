# R-17: Revisar cambios de dependencias del backend

**Alcance:** `backend/requirements.txt` y `backend/Dockerfile`.
**Justificación:** `backend/requirements.txt` lista los paquetes sin versión (`fastapi`, `uvicorn[standard]`, `debugpy`, `pytest`, `pytest-cov`, `httpx`) y `backend/Dockerfile` instala el archivo completo, incluidas las dependencias de prueba.

## Guía específica del proyecto

Al añadir o cambiar dependencias, ten en cuenta que reconstruir la imagen puede traer versiones nuevas de cualquier paquete. Considera fijar versiones y separar dependencias de ejecución y de prueba si el cambio afecta a la reproducibilidad o al tamaño de la imagen.
