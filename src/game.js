export const ACTS = ["La chispa", "Bajo las estrellas", "La gran ovación"];
export function createGame() {
  return {
    mode: "ready",
    time: 0,
    distance: 0,
    y: 0,
    vy: 0,
    lives: 3,
    score: 0,
    combo: 0,
    passed: 0,
    act: 0,
    invincible: 0,
    buffer: 0,
    next: 510,
    spawned: 0,
    obstacles: [],
    events: [],
  };
}
export function jump(g) {
  if (g.mode === "playing") g.buffer = 0.14;
}
export function update(g, dt) {
  if (g.mode !== "playing") return;
  dt = Math.min(dt, 1 / 30);
  g.time += dt;
  g.events = [];
  g.invincible = Math.max(0, g.invincible - dt);
  if (g.buffer > 0 && g.y === 0) {
    g.vy = 620;
    g.buffer = 0;
    g.events.push({ type: "jump" });
  }
  g.buffer = Math.max(0, g.buffer - dt);
  g.vy -= 1600 * dt;
  g.y = Math.max(0, g.y + g.vy * dt);
  if (g.y === 0) g.vy = 0;
  const speed = 260 + g.act * 34;
  g.distance += speed * dt;
  while (g.next < g.distance + 1600) {
    const index = g.spawned++;
    g.obstacles.push({
      at: g.next,
      kind: index % 3 === 2 ? "pot" : "ring",
      scored: false,
      hit: false,
    });
    g.next += 450 + (index % 3) * 55;
  }
  for (const o of g.obstacles) {
    const x = o.at - g.distance;
    if (!o.hit && !o.scored && Math.abs(x) < 24 && g.invincible === 0) {
      const hit = o.kind === "ring" ? g.y < 51 || g.y > 152 : g.y < 43;
      if (hit) {
        o.hit = true;
        g.lives--;
        g.combo = 0;
        g.invincible = 1.3;
        g.events.push({ type: "hit" });
        if (g.lives <= 0) {
          g.mode = "over";
          return;
        }
      }
    }
    if (x < -27 && !o.scored) {
      o.scored = true;
      g.passed++;
      if (!o.hit) {
        g.combo++;
        const perfect = o.kind === "ring" && g.y > 63 && g.y < 126;
        const points = (perfect ? 200 : 100) * Math.min(5, g.combo);
        g.score += points;
        g.events.push({ type: "score", perfect, points });
      }
      if (g.passed >= 24) {
        g.mode = "won";
        g.score += g.lives * 1000;
        g.events.push({ type: "won" });
        return;
      }
      const act = Math.floor(g.passed / 8);
      if (act !== g.act) {
        g.act = act;
        g.events.push({ type: "act" });
      }
    }
  }
  g.obstacles = g.obstacles.filter((o) => o.at - g.distance > -150);
}
