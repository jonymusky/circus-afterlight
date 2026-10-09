import { createGame, update, jump, ACTS } from "./game.js";
import { Renderer } from "./renderer.js";
import { Soundscape } from "./audio.js";
const soundscape = new Soundscape();
const $ = (id) => document.getElementById(id);
const renderer = new Renderer($("stage"));
let game = createGame(),
  last = 0,
  accumulator = 0,
  muted = true,
  best = 0,
  toastUntil = 0;
try {
  best = Math.max(0, Number(localStorage.getItem("afterlight-best")) || 0);
} catch {
  /* Storage may be disabled. */
}
const fmt = (n) => String(n).padStart(6, "0");
$("best").textContent = fmt(best);
function toast(text) {
  $("toast").textContent = text;
  toastUntil = performance.now() + 1400;
}
function start() {
  game = createGame();
  game.mode = "playing";
  accumulator = 0;
  soundscape.reset();
  $("overlay").hidden = true;
  document.querySelector(".hud").hidden = false;
  $("pause").hidden = false;
  $("pause").textContent = "Pausa Ⅱ";
  $("pause").setAttribute("aria-label", "Pausar juego");
  $("jump").hidden = false;
  $("jump").focus({ preventScroll: true });
  toast("Saltá un instante antes del aro");
  soundscape.effect("act");
}
function overlay(kind) {
  const won = kind === "won",
    paused = kind === "paused";
  $("overlay").hidden = false;
  $("eyebrow").textContent = paused
    ? "El circo te espera"
    : won
      ? "Las luces son tuyas"
      : "Siempre hay otra función";
  $("title").textContent = paused ? "INTERMEDIO" : won ? "¡BRAVO!" : "UNA MÁS";
  $("title").style.fontSize = "clamp(42px, 7vw, 90px)";
  $("description").textContent = paused
    ? "Respirá. Tu salto sigue acá."
    : `${fmt(game.score)} puntos · ${game.passed} obstáculos superados`;
  $("play").textContent = paused ? "Volver a la pista" : "Volver a jugar ↗";
  $("hint").textContent = paused
    ? "P o Escape para continuar"
    : "Cada intento, un poco más lejos.";
  $("jump").hidden = true;
  $("play").focus({ preventScroll: true });
}
function pause() {
  if (game.mode === "playing") {
    game.mode = "paused";
    overlay("paused");
    $("pause").textContent = "Continuar ▷";
    $("pause").setAttribute("aria-label", "Continuar juego");
  } else if (game.mode === "paused") {
    game.mode = "playing";
    $("overlay").hidden = true;
    $("jump").hidden = false;
    $("pause").textContent = "Pausa Ⅱ";
    $("pause").setAttribute("aria-label", "Pausar juego");
    $("jump").focus({ preventScroll: true });
  }
}
function finish() {
  if (game.score > best) {
    best = game.score;
    $("best").textContent = fmt(best);
    try {
      localStorage.setItem("afterlight-best", String(best));
    } catch {
      /* Continue without persistence. */
    }
  }
  overlay(game.mode);
  $("pause").hidden = true;
  soundscape.effect(game.mode);
  if (game.mode === "won") renderer.burst("won");
}
$("play").addEventListener("click", () =>
  game.mode === "paused" ? pause() : start(),
);
$("pause").addEventListener("click", pause);
$("jump").addEventListener("pointerdown", (e) => {
  e.preventDefault();
  jump(game);
});
$("jump").addEventListener("click", (e) => {
  if (e.detail === 0) jump(game);
});
$("sound").addEventListener("click", async () => {
  try {
    muted = !(await soundscape.toggle());
    $("sound").textContent = muted ? "Sonido off" : "Sonido on";
    $("sound").setAttribute("aria-pressed", String(!muted));
    $("sound").setAttribute(
      "aria-label",
      muted ? "Activar sonido" : "Desactivar sonido",
    );
  } catch {
    toast("Audio no disponible en este navegador");
  }
});
$("fullscreen").addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.querySelector(".theatre").requestFullscreen();
  } catch {
    toast("Pantalla completa no disponible");
  }
});
window.addEventListener("keydown", (e) => {
  if (["Space", "ArrowUp", "KeyW"].includes(e.code)) {
    if (e.target instanceof HTMLButtonElement && game.mode !== "playing")
      return;
    e.preventDefault();
    if (!e.repeat) {
      if (game.mode === "ready") start();
      else jump(game);
    }
  }
  if (["KeyP", "Escape"].includes(e.code) && !e.repeat) pause();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && game.mode === "playing") pause();
});
window.addEventListener("blur", () => {
  if (game.mode === "playing") pause();
});
function frame(now) {
  const dt = Math.min((now - last) / 1000 || 0, 0.05);
  last = now;
  accumulator += dt;
  while (accumulator >= 1 / 120) {
    const prev = game.mode;
    update(game, 1 / 120);
    if (prev === "playing") {
      for (const event of game.events) {
        if (event.type === "jump") soundscape.effect("jump");
        if (event.type === "hit") {
          renderer.burst("hit");
          soundscape.effect("hit");
          toast("¡Arriba! Todavía hay función.");
        }
        if (event.type === "score") {
          renderer.burst("score");
          soundscape.effect("score", event.perfect);
          toast(
            event.perfect
              ? `¡Perfecto! +${event.points}`
              : `¡Bien! +${event.points}`,
          );
        }
        if (event.type === "act") {
          toast(`Acto ${game.act + 1} · ${ACTS[game.act]}`);
          soundscape.effect("act");
          renderer.burst("act");
        }
      }
      if (["over", "won"].includes(game.mode)) finish();
    }
    accumulator -= 1 / 120;
  }
  soundscape.tick(game);
  $("score").textContent = fmt(game.score);
  $("lives").textContent = "● ".repeat(Math.max(0, game.lives)).trim();
  $("lives").setAttribute("aria-label", `${game.lives} vidas`);
  $("combo").textContent =
    game.combo > 1
      ? `Combo ×${Math.min(5, game.combo)}`
      : "Buscá el salto perfecto";
  $("act-name").textContent =
    `Acto ${["I", "II", "III"][game.act]} · ${ACTS[game.act]}`;
  $("stage-label").textContent =
    `0${game.act + 1} / ${ACTS[game.act]}${game.mode === "ready" ? "" : ` · ${game.passed}/24`}`;
  if (now > toastUntil) $("toast").textContent = "";
  renderer.draw(game, renderer.reduced ? 0 : now / 1000, dt);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
