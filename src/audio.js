// Original 6/8 calliope score, synthesized instruments and a procedural audience.
// All scheduling uses the AudioContext clock; the visual framerate never sets tempo.
const MELODY = [
  76, 79, 84, 83, 81, 79, 77, 81, 84, 86, 84, 81, 74, 77, 81, 79, 77, 74, 76,
  79, 84, 79, 76, 72, 76, 79, 84, 88, 86, 84, 81, 84, 89, 88, 86, 84, 83, 86,
  89, 88, 86, 83, 84, 79, 76, 72, 0, 79, 81, 84, 88, 86, 84, 81, 79, 83, 86, 84,
  83, 79, 77, 81, 84, 83, 81, 77, 76, 79, 84, 79, 76, 72, 74, 77, 81, 84, 81,
  77, 79, 83, 86, 89, 86, 83, 84, 88, 91, 88, 84, 79, 84, 0, 79, 0, 72, 0,
];
const CHORDS = [
  [48, 60, 64, 67],
  [53, 60, 65, 69],
  [50, 62, 65, 69],
  [48, 60, 64, 67],
  [57, 60, 64, 69],
  [55, 62, 67, 71],
  [53, 60, 65, 69],
  [48, 60, 64, 67],
  [57, 60, 64, 69],
  [55, 62, 67, 71],
  [53, 60, 65, 69],
  [48, 60, 64, 67],
  [50, 62, 65, 69],
  [55, 62, 67, 71],
  [48, 60, 64, 67],
  [48, 60, 64, 67],
];
const frequency = (note) => 440 * 2 ** ((note - 69) / 12);
export class Soundscape {
  constructor() {
    this.enabled = false;
    this.step = 0;
    this.next = 0;
    this.wasPlaying = false;
  }
  async toggle() {
    if (!this.ctx) this.init();
    await this.ctx.resume();
    this.enabled = !this.enabled;
    this.master.gain.setTargetAtTime(
      this.enabled ? 0.62 : 0,
      this.ctx.currentTime,
      0.05,
    );
    if (this.enabled) this.bell(84, this.ctx.currentTime, 0.5, 0.1);
    return this.enabled;
  }
  init() {
    this.ctx = new AudioContext();
    const a = this.ctx;
    this.master = a.createGain();
    this.master.gain.value = 0;
    const limiter = a.createDynamicsCompressor();
    limiter.threshold.value = -16;
    limiter.ratio.value = 5;
    this.master.connect(limiter);
    limiter.connect(a.destination);
    // Short diffuse room: quiet stereo reflections preserve crisp input sounds.
    const delay = a.createDelay(0.5);
    delay.delayTime.value = 0.14;
    const wet = a.createGain();
    wet.gain.value = 0.15;
    this.master.connect(delay);
    delay.connect(wet);
    wet.connect(limiter);
    this.wave = a.createPeriodicWave(
      new Float32Array([0, 0, 0, 0, 0, 0]),
      new Float32Array([0, 1, 0.26, 0.12, 0.035, 0.018]),
    );
    this.noise = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const fire = a.createBufferSource();
    fire.buffer = this.noise;
    fire.loop = true;
    const filter = a.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 650;
    this.fire = a.createGain();
    this.fire.gain.value = 0;
    fire.connect(filter);
    filter.connect(this.fire);
    this.fire.connect(this.master);
    fire.start();
  }
  note(midi, time, duration, volume = 0.06, type = "calliope") {
    if (!midi) return;
    const a = this.ctx,
      o = a.createOscillator(),
      v = a.createGain();
    if (type === "calliope") o.setPeriodicWave(this.wave);
    else o.type = type;
    o.frequency.value = frequency(midi);
    v.gain.setValueAtTime(0, time);
    v.gain.linearRampToValueAtTime(volume, time + 0.012);
    v.gain.exponentialRampToValueAtTime(0.001, time + duration);
    o.connect(v);
    v.connect(this.master);
    o.start(time);
    o.stop(time + duration + 0.02);
  }
  bell(midi, time, duration = 0.3, volume = 0.065) {
    this.note(midi, time, duration, volume, "sine");
    this.note(midi + 19, time, duration * 0.35, volume * 0.25, "sine");
  }
  noiseHit(time, duration, volume, cutoff = 1600) {
    const a = this.ctx,
      n = a.createBufferSource(),
      v = a.createGain(),
      f = a.createBiquadFilter();
    n.buffer = this.noise;
    f.type = "bandpass";
    f.frequency.value = cutoff;
    f.Q.value = 0.6;
    v.gain.setValueAtTime(volume, time);
    v.gain.exponentialRampToValueAtTime(0.001, time + duration);
    n.connect(f);
    f.connect(v);
    v.connect(this.master);
    n.start(time, Math.random());
    n.stop(time + duration);
  }
  tick(game) {
    if (!this.ctx || !this.enabled) return;
    const a = this.ctx,
      playing = game.mode === "playing";
    const nearest = game.obstacles.reduce(
      (d, o) => Math.min(d, Math.abs(o.at - game.distance)),
      1000,
    );
    this.fire.gain.setTargetAtTime(
      playing ? Math.max(0, 1 - nearest / 350) * 0.024 : 0,
      a.currentTime,
      0.08,
    );
    if (!playing) {
      this.wasPlaying = false;
      return;
    }
    if (!this.wasPlaying) {
      this.next = a.currentTime + 0.03;
      this.wasPlaying = true;
    }
    const interval = 60 / (116 + game.act * 10) / 3;
    while (this.next < a.currentTime + 0.1) {
      const step = this.step % MELODY.length,
        beat = step % 6,
        chord = CHORDS[Math.floor(step / 6)];
      this.note(MELODY[step], this.next, interval * 0.88, 0.055);
      if (beat === 0 || beat === 3) {
        this.note(
          chord[0] + (beat === 3 ? 7 : 0),
          this.next,
          interval * 1.6,
          0.11,
          "triangle",
        );
        this.noiseHit(this.next, 0.05, 0.025, 140);
      }
      if (beat === 1 || beat === 4)
        for (const n of chord.slice(1))
          this.note(n, this.next, interval * 0.72, 0.023);
      if (beat === 2 || beat === 5)
        this.noiseHit(this.next, 0.055, 0.025, 4800);
      if (game.y === 0 && beat % 2 === 0)
        this.noiseHit(this.next, 0.035, 0.035, 330);
      this.step++;
      this.next += interval;
    }
  }
  effect(type, perfect = false) {
    if (!this.ctx || !this.enabled) return;
    const a = this.ctx,
      t = a.currentTime;
    if (type === "jump") {
      const o = a.createOscillator(),
        g = a.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(240, t);
      o.frequency.exponentialRampToValueAtTime(560, t + 0.17);
      g.gain.setValueAtTime(0.09, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g);
      g.connect(this.master);
      o.start();
      o.stop(t + 0.21);
      this.noiseHit(t, 0.08, 0.08, 700);
    }
    if (type === "score") {
      [0, 4, 7].forEach((n, i) =>
        this.bell((perfect ? 84 : 79) + n, t + i * 0.055, 0.3, 0.055),
      );
      if (perfect) this.cheer(0.35);
    }
    if (type === "hit") {
      this.noiseHit(t, 0.25, 0.18, 250);
      [55, 51, 48].forEach((n, i) =>
        this.note(n, t + i * 0.065, 0.18, 0.08, "triangle"),
      );
    }
    if (type === "act" || type === "won") {
      [72, 76, 79, 84, 79, 84, 88, 91].forEach((n, i) =>
        this.note(n, t + i * 0.12, 0.28, 0.09),
      );
      this.cheer(type === "won" ? 2.2 : 1);
    }
    if (type === "over")
      [67, 64, 62, 60, 48].forEach((n, i) =>
        this.note(n, t + i * 0.18, 0.4, 0.065),
      );
  }
  cheer(duration) {
    const t = this.ctx.currentTime;
    for (let i = 0; i < Math.ceil(duration * 16); i++)
      this.noiseHit(t + i * 0.06, 0.09, 0.045, 900 + Math.random() * 1800);
    this.note(91, t + 0.12, duration * 0.7, 0.012, "sine");
  }
  reset() {
    this.step = 0;
    this.wasPlaying = false;
  }
}
