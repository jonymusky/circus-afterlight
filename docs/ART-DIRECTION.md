# Dirección de arte

Circus Afterlight combina la memoria del arcade con una carpa teatral contemporánea. Azul nocturno `#151c29`, petróleo `#112a37`, terciopelo `#80393f`, oro `#efbe72`, marfil `#f9e9cb` y turquesa `#86d9cf`. El título usa Georgia monumental; la interfaz usa sans serif discreta. El escenario ocupa el centro de la experiencia, encuadrado por un arco de proscenio.

## Assets y procedencia

Generados con la herramienta integrada de generación de imágenes de OpenAI y optimizados a WebP. No se copiaron sprites ni grabaciones del juego original. El código de render conserva un fallback procedural si los assets no cargan.

- `assets/circus-stage.webp`: escenografía, 1536 × 1024.
- `assets/lion-run.webp`: sprites con alfa, seis cuadros de 512 × 512, grilla 3 × 2.

### Prompt: escenografía

Use case: stylized-concept. Asset type: high quality landscape 1536x1024 background painting for a playable contemporary 2D circus platform arcade game named Circus Afterlight. Create an exceptionally beautiful theatrical nighttime circus interior, rich painterly 3D animated film production design, sophisticated handcrafted materials, magical dramatic lighting. Side-on symmetric wide view from across the arena. Majestic midnight teal and blue striped circus tent canopy, enormous burgundy velvet drapes framing left and right, ornate antique gold filigree arches and carved columns, strings of hundreds of warm bulbs, tiny packed audience in tiered bleachers, hazy golden and blue spotlights, subtle floating dust. The back of the arena has a richly decorated central small arched entrance with scalloped fabric and stars. Lower 22 percent is a mostly empty warm brown stage floor, clear straight horizontal front stage line at 78 percent height; stage visible and uncluttered for gameplay. Central upper 55 percent has muted dark teal negative space so overlaid title text can read. Strong sense of depth, warm amber rim light against cool teal atmosphere, extraordinary material richness, whimsical elegant European circus poster meets modern animated film. No foreground people, no animals, no fire hoops, no text, no letters, no words, no logos, no UI, no watermarks. This is only the environment game art. Wide landscape composition.

### Prompt: personaje

Use case: stylized-concept. Asset type: transparent sprite sheet for a premium 2D side scrolling circus game. Create ONE precisely aligned 3 columns by 2 rows animation sprite sheet, overall 1536 x 1024, six equal square cells of 512 x 512 pixels. Each cell contains the exact same character pair, identical proportions, color, scale and position: a charming brave golden lion with a luxuriant layered caramel mane, small rounded ears, expressive friendly eyes, a proudly lifted curved tail and big paws, running towards the RIGHT in perfectly SIDE PROFILE. Riding the lion is a tiny joyful young adult circus ringmaster with a midnight teal top hat, turquoise coat with gold buttons, cream trousers, brown boots and flowing coral scarf. Luxurious high quality hand-painted 3D animation film game art, golden fur with visible tufts, highly polished stylized volumetric rendering, warm golden edge highlights, cool teal shadow. The SIX cells show six consecutive different phases of the running cycle, with distinctly different foreleg and hindleg poses, scarf swaying, rider bouncing slightly, same character consistency. Center each pair within its own cell with 40px transparent margins all around; ground baseline at 455px within every 512px cell, lion and rider total height approximately 360px, total width approximately 420px. Absolutely no overlap between cells. Clean isolated alpha transparent background, NO checkerboard, NO ground, NO shadows outside character, NO border lines, NO text, NO labels, NO cell numbers, NO props, NO scenery. All characters face right. Exact 3x2 regular grid. This should feel like a premium modern reimagining of a nostalgic circus arcade.

## Sonido

Partitura original de 16 compases en 6/8. Calliope con armónicos definidos mediante PeriodicWave, bajo triangular, acordes a contratiempo y percusión filtrada. El tempo aumenta por acto. El audio se programa sobre el reloj de AudioContext con 100 ms de anticipación y pasa por compresión y una reflexión corta. Aplausos, brasas y pisadas se sintetizan con ruido filtrado. No hay samples ni música de terceros.
