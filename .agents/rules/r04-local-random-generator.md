# R-04: Evitar el generador global de random

**Alcance:** Código Python que use aleatoriedad, especialmente `backend/app/routes.py`.
**Justificación:** `generate_mock_movements` en `backend/app/routes.py` llama a `random.seed(seed)` y después usa `random.random`, `random.randint`, `random.uniform` y `random.choice` del módulo. Todos los endpoints la invocan con `seed=42`, así que cada petición reinicia el generador global del proceso.
**Estado actual:** `generate_mock_movements` no cumple esta regla. Corrígela solo si la tarea lo pide; en otro caso, pregunta antes de cambiarla.

## Guía específica del proyecto

El código nuevo que necesite aleatoriedad debe usar una instancia independiente, por ejemplo `random.Random(seed)`, en lugar de `random.seed()` y las funciones globales del módulo. Si migras `generate_mock_movements`, una instancia `random.Random(42)` produce la misma secuencia que el generador global con la misma semilla, por lo que los datos no cambian.
