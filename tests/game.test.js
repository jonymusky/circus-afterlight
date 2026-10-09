import { test } from "node:test";
import assert from "node:assert/strict";
import { createGame, jump, update } from "../src/game.js";
const running = () => ({ ...createGame(), mode: "playing" });
function advance(g, seconds) {
  for (let i = 0; i < seconds * 120; i++) update(g, 1 / 120);
}
test("jump returns to the floor and cannot double-jump", () => {
  const g = running();
  jump(g);
  advance(g, 0.15);
  const velocity = g.vy;
  assert.ok(g.y > 0);
  jump(g);
  update(g, 1 / 120);
  assert.ok(g.vy < velocity);
  advance(g, 1);
  assert.equal(g.y, 0);
});
test("pause freezes simulation and ignores jump input", () => {
  const g = running();
  advance(g, 1);
  g.mode = "paused";
  const before = structuredClone(g);
  jump(g);
  advance(g, 1);
  assert.deepEqual(g, before);
});
test("collision costs one life and grants invulnerability", () => {
  const g = running();
  g.obstacles = [
    { at: 5, kind: "ring" },
    { at: 7, kind: "pot" },
  ];
  update(g, 1 / 120);
  assert.equal(g.lives, 2);
  advance(g, 0.1);
  assert.equal(g.lives, 2);
  assert.equal(g.combo, 0);
});
test("clearing a hoop awards points once", () => {
  const g = running();
  g.y = 90;
  g.obstacles = [{ at: -30, kind: "ring" }];
  update(g, 1 / 120);
  assert.equal(g.score, 200);
  assert.equal(g.combo, 1);
  advance(g, 0.1);
  assert.equal(g.score, 200);
});
test("three collisions end the show", () => {
  const g = running();
  g.lives = 1;
  g.obstacles = [{ at: 0, kind: "pot" }];
  update(g, 1 / 120);
  assert.equal(g.mode, "over");
  const d = g.distance;
  advance(g, 2);
  assert.equal(g.distance, d);
});
test("24 obstacles complete the three-act show", () => {
  const g = running();
  g.passed = 23;
  g.act = 2;
  g.obstacles = [{ at: -30, kind: "pot" }];
  update(g, 1 / 120);
  assert.equal(g.mode, "won");
  assert.equal(g.score, 3100);
});
test("an achievable jump timing clears every act without damage", () => {
  const g = running();
  for (let frame = 0; frame < 120 * 70 && g.mode === "playing"; frame++) {
    const next = g.obstacles.find((o) => !o.scored && !o.hit);
    const speed = 260 + g.act * 34;
    if (next && g.y === 0 && (next.at - g.distance) / speed < 0.4) jump(g);
    update(g, 1 / 120);
  }
  assert.equal(g.mode, "won");
  assert.equal(g.lives, 3);
  assert.ok(g.score > 15000);
});
