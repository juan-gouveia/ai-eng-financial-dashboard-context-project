# R-16: Revisar cambios de dependencias y lockfile del frontend

**Alcance:** `frontend/package.json` y `frontend/package-lock.json`.
**Justificación:** `frontend/package.json` declara versiones con rangos (`^`, `~`), así que `npm install` puede reescribir `frontend/package-lock.json` sin cambios en `package.json`; ocurrió en el commit `18ae052`. `frontend/Dockerfile` también ejecuta `npm install`.

## Guía específica del proyecto

Al cambiar dependencias, revisa el diff de `package-lock.json` junto con `package.json`. No incluyas regeneraciones del lockfile ajenas al cambio; si son necesarias, sepáralas en un commit. Para instalar sin modificar el lockfile, usa `npm ci`.
