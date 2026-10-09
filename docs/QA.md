# Validación de la primera edición

Fecha: 2026-10-09.

- `npm run check`, `npm test` y `npm run build`: correctos en local y GitHub Actions, Node 22 en CI.
- 8 pruebas: una de reactivación del audio sin notas acumuladas y 7 de simulación: salto y bloqueo de doble salto, pausa, colisión e invulnerabilidad, puntuación única, derrota, victoria y partida completa.
- Partida completa a través de eventos de teclado del navegador, acelerando únicamente el reloj de animación: 24 obstáculos, 21.200 puntos, 3 vidas. Se verificaron pantalla de victoria, récord, reinicio, pausa y continuación. No se expone una API de debug en producción.
- Inspección visual en Chromium a 1440 × 1000 y viewport móvil de 390 × 844; sin desbordamiento horizontal. No se probaron dispositivos físicos ni otros motores de navegador.
- Audio activado mediante un clic real: AudioContext en estado `running`, señal no nula medida con AnalyserNode (RMS máximo observado: 0,0407). La evaluación de la composición fue estructural; esta medición verifica salida, no calidad subjetiva de escucha.
- Axe WCAG 2 A/AA: cero violaciones automáticas. El contraste sobre canvas exige revisión visual manual; esta prueba no certifica accesibilidad completa del juego.
- Publicación real: escenario y sprites WebP cargan correctamente desde GitHub Pages; sin errores de JavaScript en la sesión de prueba.

El alcance actual es una reinterpretación del acto del león y los aros, con tres fases de dificultad. No incluye las demás disciplinas del juego original.
