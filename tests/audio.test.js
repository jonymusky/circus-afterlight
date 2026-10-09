import { test } from "node:test";
import assert from "node:assert/strict";
import { Soundscape } from "../src/audio.js";
import { createGame } from "../src/game.js";

test("unmuting after a long gap restarts scheduling without replaying old notes", async () => {
  const sound = new Soundscape();
  sound.ctx = { currentTime: 120, resume: async () => {} };
  sound.master = { gain: { setTargetAtTime() {} } };
  sound.fire = { gain: { setTargetAtTime() {} } };
  sound.bell = () => {};
  sound.noiseHit = () => {};
  let notes = 0;
  sound.note = () => {
    notes++;
  };
  sound.wasPlaying = true;
  sound.next = 0;
  await sound.toggle();
  assert.equal(sound.enabled, true);
  assert.equal(sound.wasPlaying, false);
  sound.tick({ ...createGame(), mode: "playing" });
  assert.ok(sound.next > 120);
  assert.ok(
    notes > 0 && notes < 10,
    "only the current scheduling window should play",
  );
});
