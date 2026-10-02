# R-05: Respetar la convención local de imports

**Alcance:** Imports dentro de `frontend/src/`.
**Justificación:** En `frontend/src/`, los imports relativos existentes enlazan siempre módulos del mismo directorio, y los que cruzan directorios usan el alias `@/`, definido en `frontend/vite.config.ts` y `frontend/tsconfig.app.json`.

## Guía específica del proyecto

Usa imports relativos (`./`) para dependencias del mismo directorio y `@/` al cruzar directorios de `src`. No conviertas imports de forma masiva para imponer un estilo único.
