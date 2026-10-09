# Contribuir

Abrí un issue para proponer cambios grandes y un pull request para mejoras concretas. Describí el problema, el comportamiento esperado y cómo lo verificaste.

- Mantené la simulación en `src/game.js` libre del DOM, audio y reloj real.
- Usá el paso fijo existente; no introduzcas física dependiente del framerate.
- Agregá pruebas para cambios en colisiones, puntuación o progresión.
- Probá teclado y pantalla táctil, pausa, reinicio, sonido y movimiento reducido.
- Evitá dependencias y assets remotos salvo necesidad justificada.
- Usá únicamente arte, música y código originales o con licencia compatible.

Antes de abrir un PR: `npm run check`, `npm test` y `npm run build`.
