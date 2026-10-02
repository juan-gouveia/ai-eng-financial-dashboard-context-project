# R-06: Verificar alias y recursos antes de usarlos

**Alcance:** Imports, aliases, imágenes y datos de ejemplo del frontend.
**Justificación:** `frontend/components.json` declara el alias `"hooks": "@/hooks"`, pero `frontend/src/hooks/` no existe. `frontend/src/assets/hero.png` y `mockMovements` (`frontend/src/lib/mock-data.ts`) no se importan en ningún archivo de `frontend/src`.

## Guía específica del proyecto

Antes de depender de un alias o recurso, confirma que su ruta existe y que participa en el flujo activo. No supongas que una declaración en `frontend/components.json` implica que el módulo existe. No elimines aliases ni recursos sin uso sin preguntar antes, aunque no encuentres consumidores.
