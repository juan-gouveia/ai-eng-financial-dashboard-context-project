# R-18: Reutilizar los tokens visuales existentes

**Alcance:** Estilos y componentes del dashboard bajo `frontend/src/`.
**Justificación:** `frontend/src/index.css` define los tokens de tema (`--chart-income`, `--chart-outcome`, `--chart-profit`, `--income-badge`, etc.) en `:root` y en `.dark`. Los componentes de `frontend/src/components/dashboard/` los usan con `var(--...)` y no contienen colores hex ni paletas Tailwind fijas.

## Guía específica del proyecto

Antes de introducir colores nuevos, reutiliza los tokens de `frontend/src/index.css` y las clases Tailwind existentes. Si agregas un token, defínelo en `:root` y `.dark` para mantener ambos temas.
