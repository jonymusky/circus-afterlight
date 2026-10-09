const TAU = Math.PI * 2;
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.c = canvas.getContext("2d");
    this.particles = [];
    this.backdrop = new Image();
    this.backdrop.src = new URL(
      "../assets/circus-stage.webp",
      import.meta.url,
    ).href;
    this.sprite = new Image();
    this.sprite.src = new URL("../assets/lion-run.webp", import.meta.url).href;
    this.shake = 0;
    this.celebrate = 0;
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.resize();
    new ResizeObserver(() => this.resize()).observe(canvas);
  }
  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.w = r.width;
    this.h = r.height;
    const d = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = r.width * d;
    this.canvas.height = r.height * d;
    this.d = d;
    this.s = this.h / 620;
    this.floor = this.h * 0.79;
    this.px = this.w * 0.25;
  }
  ellipse(x, y, rx, ry, color) {
    const c = this.c;
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, TAU);
    c.fill();
  }
  line(points, color, width = 1) {
    const c = this.c;
    c.strokeStyle = color;
    c.lineWidth = width;
    c.beginPath();
    points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.stroke();
  }
  burst(type) {
    if (this.reduced) return;
    if (type === "hit") this.shake = 0.23;
    if (type === "won" || type === "act") this.celebrate = 2;
    for (let i = 0; i < (type === "hit" ? 35 : 22); i++)
      this.particles.push({
        x: this.px,
        y: this.floor - 95 * this.s,
        vx: (Math.random() - 0.5) * 260,
        vy: -Math.random() * 240,
        life: 1,
        color: type === "hit" ? "#ff7957" : i % 2 ? "#ffe0a0" : "#8ee8dc",
      });
  }
  draw(g, t, dt) {
    const c = this.c,
      w = this.w,
      h = this.h,
      s = this.s;
    c.setTransform(this.d, 0, 0, this.d, 0, 0);
    c.clearRect(0, 0, w, h);
    if (this.shake > 0) {
      this.shake -= dt;
      c.translate(
        Math.sin(t * 70) * this.shake * 15,
        Math.cos(t * 85) * this.shake * 8,
      );
    }
    if (this.backdrop.complete && this.backdrop.naturalWidth) {
      const iw = this.backdrop.naturalWidth,
        ih = this.backdrop.naturalHeight;
      const crop = Math.min(iw, (ih * w) / h);
      c.drawImage(this.backdrop, (iw - crop) / 2, 0, crop, ih, 0, 0, w, h);
      c.fillStyle =
        g.act === 1 ? "#20488125" : g.act === 2 ? "#a1392618" : "#06172718";
      c.fillRect(0, 0, w, h);
    } else {
      const bg = c.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#112a37");
      bg.addColorStop(0.6, g.act === 1 ? "#25324c" : "#25414a");
      bg.addColorStop(1, "#121f2b");
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);
      // Vast striped canopy, painted into the world instead of a background image.
      for (let i = -7; i < 9; i++) {
        c.beginPath();
        c.moveTo(w * 0.5, -h * 0.22);
        c.lineTo(w * 0.5 + i * w * 0.15, h * 0.74);
        c.lineTo(w * 0.5 + (i + 1) * w * 0.15, h * 0.74);
        c.closePath();
        c.fillStyle = i % 2 ? "#c1a77506" : "#05132023";
        c.fill();
      }
      for (let i = 0; i < 65; i++) {
        const x = (i * 137.51) % w,
          y = 60 + ((i * 71.3) % (h * 0.49));
        this.ellipse(
          x,
          y,
          i % 5 === 0 ? 1.5 : 0.7,
          i % 5 === 0 ? 1.5 : 0.7,
          `rgba(244,216,161,${0.15 + (Math.sin(t * 0.6 + i) + 1) * 0.12})`,
        );
      }
      // Soft intersecting spotlights.
      c.globalCompositeOperation = "screen";
      for (let i = 0; i < 3; i++) {
        const x = w * (0.2 + i * 0.3),
          end = w * (0.18 + i * 0.31) + Math.sin(t * 0.18 + i) * w * 0.1;
        const grad = c.createLinearGradient(x, 0, end, this.floor);
        grad.addColorStop(0, "#ffe1a018");
        grad.addColorStop(1, "#b4f3ec00");
        c.fillStyle = grad;
        c.beginPath();
        c.moveTo(x, 25);
        c.lineTo(end - 150 * s, this.floor);
        c.lineTo(end + 150 * s, this.floor);
        c.closePath();
        c.fill();
      }
      c.globalCompositeOperation = "source-over";
      // Rear proscenium arches.
      for (let j = 0; j < 3; j++) {
        c.strokeStyle = ["#ebc17a15", "#ebc17a17", "#ebc17a20"][j];
        c.lineWidth = 1;
        c.beginPath();
        c.ellipse(
          w / 2,
          this.floor,
          w * (0.32 + j * 0.095),
          h * (0.56 + j * 0.045),
          0,
          Math.PI,
          TAU,
        );
        c.stroke();
      }
      // Audience silhouettes and little warm table lights.
      for (let row = 0; row < 3; row++) {
        for (let i = -1; i < w / 25 + 1; i++) {
          const x = i * 25 + (row % 2) * 12,
            y = this.floor - 16 - row * 23;
          this.ellipse(x, y, 7, 9, row === 0 ? "#101c29" : "#172631");
          this.ellipse(x, y + 12, 12, 10, row === 0 ? "#101c29" : "#172631");
          if (i % 5 === 0) this.ellipse(x + 10, y - 7, 1.3, 1.3, "#e9bd7666");
        }
      }
      // Velvet side curtains.
      for (const side of [0, 1]) {
        c.save();
        if (side) {
          c.translate(w, 0);
          c.scale(-1, 1);
        }
        const cw = Math.min(w * 0.15, 150);
        const velvet = c.createLinearGradient(0, 0, cw, 0);
        velvet.addColorStop(0, "#301a2a");
        velvet.addColorStop(0.45, "#80393f");
        velvet.addColorStop(0.75, "#51222f");
        velvet.addColorStop(1, "#2e1e2c");
        c.fillStyle = velvet;
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(cw * 1.5, 0);
        c.bezierCurveTo(cw, h * 0.13, cw * 0.7, h * 0.36, cw * 0.36, h * 0.52);
        c.lineTo(cw * 0.55, this.floor);
        c.lineTo(0, this.floor);
        c.fill();
        for (let i = 1; i < 6; i++)
          this.line(
            [
              [i * cw * 0.19, 0],
              [i * cw * 0.055, h * 0.5],
              [i * cw * 0.085, this.floor],
            ],
            "#ec9f7220",
            2,
          );
        this.line(
          [
            [0, h * 0.5],
            [cw * 0.37, h * 0.52],
          ],
          "#d7a962",
          4,
        );
        c.restore();
      }
      // Festoon string.
      c.strokeStyle = "#b8945e77";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(0, 35);
      c.quadraticCurveTo(w / 2, h * 0.25, w, 35);
      c.stroke();
      for (let i = 0; i <= 24; i++) {
        const u = i / 24,
          x = u * w,
          y = 35 + 2 * u * (1 - u) * (h * 0.25 - 35);
        c.shadowColor = "#ffc76d";
        c.shadowBlur = 9;
        this.ellipse(x, y, 2.1, 2.7, "#ffe2a0");
      }
      c.shadowBlur = 0;
      const floorGrad = c.createLinearGradient(0, this.floor, 0, h);
      floorGrad.addColorStop(0, "#bd7154");
      floorGrad.addColorStop(0.06, "#714342");
      floorGrad.addColorStop(0.6, "#322c36");
      floorGrad.addColorStop(1, "#182330");
      c.fillStyle = floorGrad;
      c.fillRect(0, this.floor, w, h - this.floor);
      this.line(
        [
          [0, this.floor],
          [w, this.floor],
        ],
        "#f5c37c",
        2,
      );
      for (let i = -10; i < 20; i++) {
        const x = i * 130 - ((g.distance * 0.4) % 130);
        this.line(
          [
            [x, this.floor],
            [w / 2 + (x - w / 2) * 1.5, h],
          ],
          "#eaa87815",
        );
      }
      this.line(
        [
          [0, this.floor + 30 * s],
          [w, this.floor + 30 * s],
        ],
        "#ecc18322",
      );
    }
    this.atmosphere(g, t, dt);
    const active = ["playing", "paused", "over", "won"].includes(g.mode);
    if (active) {
      for (const o of g.obstacles) {
        const x = this.px + (o.at - g.distance) * s;
        if (x > -100 && x < w + 100) this.obstacle(x, o.kind, t, o.hit, false);
      }
      this.lion(this.px, this.floor - g.y * s, s, t, g.invincible > 0);
      for (const o of g.obstacles) {
        const x = this.px + (o.at - g.distance) * s;
        if (o.kind === "ring" && x > -100 && x < w + 100)
          this.obstacle(x, o.kind, t, o.hit, true);
      }
    } else {
      this.lion(w * 0.25, this.floor, s * 1.18, t, false);
      this.obstacle(w * 0.76, "ring", t, false, false);
      this.obstacle(w * 0.76, "ring", t, false, true);
      this.obstacle(w * 0.88, "pot", t, false, false);
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt;
      c.globalAlpha = Math.max(0, p.life);
      this.ellipse(p.x, p.y, 2.5, 2.5, p.color);
    }
    c.globalAlpha = 1;
  }
  atmosphere(g, t, dt) {
    const c = this.c,
      w = this.w,
      h = this.h,
      s = this.s;
    c.save();
    c.globalCompositeOperation = "screen";
    for (let i = 0; i < 4; i++) {
      const origin = w * (i % 2 ? 0.86 : 0.14),
        target =
          w * (0.15 + i * 0.23) + Math.sin(t * 0.22 + i * 1.9) * w * 0.14;
      const light = c.createLinearGradient(origin, 60, target, this.floor);
      light.addColorStop(0, "#ffdda527");
      light.addColorStop(1, i % 2 ? "#b2e8f200" : "#ffce8500");
      c.fillStyle = light;
      c.beginPath();
      c.moveTo(origin, 55);
      c.lineTo(target - 95 * s, this.floor);
      c.lineTo(target + 95 * s, this.floor);
      c.closePath();
      c.fill();
    }
    for (let i = 0; i < 48; i++) {
      const x = (i * 173.71 + Math.sin(t * 0.3 + i) * 20) % w,
        y = (i * 57.43 - t * (3 + (i % 4)) + h * 20) % h;
      c.globalAlpha = 0.15 + (Math.sin(i + t) + 1) * 0.14;
      this.ellipse(x, y, i % 3 ? 1 : 1.7, i % 3 ? 1 : 1.7, "#ffe6b4");
    }
    c.globalAlpha = 1;
    const objects =
      g.mode === "ready"
        ? [
            { at: w * 0.76, kind: "ring" },
            { at: w * 0.88, kind: "pot" },
          ]
        : g.obstacles.map((o) => ({
            at: this.px + (o.at - g.distance) * s,
            kind: o.kind,
          }));
    for (const o of objects) {
      if (o.at < -80 || o.at > w + 80) continue;
      const glow = c.createRadialGradient(
        o.at,
        this.floor - 45 * s,
        0,
        o.at,
        this.floor - 45 * s,
        115 * s,
      );
      glow.addColorStop(0, "#ff9c4928");
      glow.addColorStop(1, "#ff6b2000");
      c.fillStyle = glow;
      c.fillRect(o.at - 115 * s, this.floor - 160 * s, 230 * s, 230 * s);
      for (let i = 0; i < 13; i++) {
        const age = (t * (0.4 + (i % 3) * 0.1) + i * 0.13) % 1,
          ex = o.at + Math.sin(i * 8 + t) * 22 * s,
          ey = this.floor - (30 + age * (o.kind === "ring" ? 280 : 90)) * s;
        c.globalAlpha = (1 - age) * 0.7;
        this.ellipse(ex, ey, 1.5 * s, 2 * s, "#ffc471");
      }
      c.globalAlpha = 1;
    }
    c.restore();
    // Silhouettes in the nearest audience row move subtly with the show.
    for (let i = 0; i < Math.ceil(w / 40); i++) {
      const x = i * 40 + 12,
        bob = this.reduced ? 0 : Math.sin(t * 2 + i) * 1.5;
      this.ellipse(x, this.floor - 23 * s + bob, 4 * s, 5 * s, "#142029aa");
      if (g.combo > 2) {
        this.line(
          [
            [x - 5 * s, this.floor - 12 * s],
            [x - 11 * s, this.floor - 27 * s + bob],
          ],
          "#15202999",
          3 * s,
        );
        this.line(
          [
            [x + 5 * s, this.floor - 12 * s],
            [x + 11 * s, this.floor - 27 * s - bob],
          ],
          "#15202999",
          3 * s,
        );
      }
    }
    if (this.celebrate > 0 && !this.reduced) {
      this.celebrate -= dt;
      for (let i = 0; i < 7; i++)
        this.particles.push({
          x: Math.random() * w,
          y: -5,
          vx: (Math.random() - 0.5) * 90,
          vy: Math.random() * 60,
          life: 1.5,
          color: ["#efbe72", "#77d1c8", "#ff896d"][i % 3],
        });
    }
  }
  obstacle(x, kind, t, hit, front) {
    const c = this.c,
      s = this.s;
    c.save();
    c.translate(x, this.floor);
    c.scale(s, s);
    if (hit) c.globalAlpha = 0.4;
    if (kind === "ring") {
      if (!front) {
        this.ellipse(0, 1, 39, 6, "#11192366");
        const reflection = c.createRadialGradient(0, 4, 0, 0, 4, 55);
        reflection.addColorStop(0, "#ffb55640");
        reflection.addColorStop(1, "#ffb55600");
        c.save();
        c.scale(1, 0.2);
        c.fillStyle = reflection;
        c.fillRect(-55, -25, 110, 110);
        c.restore();
      }
      const start = front ? -Math.PI / 2 : Math.PI / 2,
        end = front ? Math.PI / 2 : Math.PI * 1.5;
      c.shadowColor = "#ff8a30";
      c.shadowBlur = 25;
      c.strokeStyle = "#b36228";
      c.lineWidth = 7;
      c.beginPath();
      c.ellipse(0, -152, 35, 140, 0, start, end);
      c.stroke();
      c.strokeStyle = "#ffc36b";
      c.lineWidth = 2;
      c.stroke();
      c.shadowBlur = 0;
      const flame = c.createLinearGradient(0, -315, 0, 0);
      flame.addColorStop(0, "#ffce6b");
      flame.addColorStop(0.5, "#ff983bcc");
      flame.addColorStop(1, "#ffe29f");
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * TAU;
        if (front ? Math.cos(a) < 0 : Math.cos(a) > 0) continue;
        const px = Math.cos(a) * 35,
          py = -152 + Math.sin(a) * 140,
          f = 10 + Math.sin(t * 17 + i * 5) * 5 + Math.sin(t * 9 + i) * 3;
        c.fillStyle = flame;
        c.beginPath();
        c.moveTo(px - 4, py + 3);
        c.bezierCurveTo(
          px - 8,
          py - f * 0.4,
          px + Math.sin(t * 10 + i) * 7,
          py - f,
          px + Math.sin(t * 13 + i) * 3,
          py - f - 5,
        );
        c.bezierCurveTo(px + 7, py - f * 0.3, px + 6, py, px + 4, py + 3);
        c.fill();
        c.fillStyle = "#fff0bc";
        c.beginPath();
        c.moveTo(px - 2, py + 2);
        c.quadraticCurveTo(px - 2, py - 4, px + 1, py - f * 0.6);
        c.quadraticCurveTo(px + 4, py, px + 2, py + 2);
        c.fill();
      }
    } else if (!front) {
      this.ellipse(0, 0, 34, 6, "#10162266");
      const bronze = c.createLinearGradient(-28, 0, 28, 0);
      bronze.addColorStop(0, "#392c31");
      bronze.addColorStop(0.3, "#b67e4c");
      bronze.addColorStop(0.55, "#e0b97b");
      bronze.addColorStop(0.8, "#8d583c");
      bronze.addColorStop(1, "#342731");
      this.line(
        [
          [-14, -4],
          [-20, 2],
        ],
        "#b18a56",
        5,
      );
      this.line(
        [
          [14, -4],
          [20, 2],
        ],
        "#b18a56",
        5,
      );
      c.fillStyle = bronze;
      c.beginPath();
      c.moveTo(-27, -25);
      c.quadraticCurveTo(-22, 0, 0, -1);
      c.quadraticCurveTo(22, 0, 27, -25);
      c.closePath();
      c.fill();
      this.ellipse(0, -25, 28, 6, "#edc584");
      this.ellipse(0, -26, 24, 4, "#5a3426");
      this.line(
        [
          [-17, -13],
          [17, -13],
        ],
        "#f1c67988",
        1,
      );
      c.shadowColor = "#ff822f";
      c.shadowBlur = 18;
      for (let i = 0; i < 9; i++) {
        const px = i * 5 - 20,
          f = 25 + Math.sin(t * 14 + i * 2) * 10;
        const flame = c.createLinearGradient(0, -26 - f, 0, -24);
        flame.addColorStop(0, "#ff603b00");
        flame.addColorStop(0.25, "#ff8b35");
        flame.addColorStop(1, "#fff1bd");
        c.fillStyle = flame;
        c.beginPath();
        c.moveTo(px - 5, -24);
        c.bezierCurveTo(
          px - 8,
          -35,
          px + Math.sin(t * 9 + i) * 10,
          -42,
          px + Math.cos(t * 11 + i) * 6,
          -26 - f,
        );
        c.quadraticCurveTo(px + 9, -32, px + 5, -24);
        c.fill();
      }
      c.shadowBlur = 0;
    }
    c.restore();
  }
  lion(x, y, s, t, blink) {
    const c = this.c;
    if (this.sprite.complete && this.sprite.naturalWidth) {
      const frame = this.reduced ? 0 : Math.floor(t * 11) % 6;
      const size = 210 * s;
      this.ellipse(x, this.floor, 65 * s, 8 * s, "#0a121b66");
      c.save();
      if (blink && Math.floor(t * 12) % 2) c.globalAlpha = 0.4;
      c.drawImage(
        this.sprite,
        (frame % 3) * 512,
        Math.floor(frame / 3) * 512,
        512,
        512,
        x - size * 0.52,
        y - size * 0.89,
        size,
        size,
      );
      c.restore();
      return;
    }
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    if (blink && Math.floor(t * 12) % 2) c.globalAlpha = 0.35;
    const run = this.reduced ? 0 : Math.sin(t * 14);
    this.ellipse(0, 0, 56, 7, "#0b152650");
    // A flowing tail, four running paws and a sculpted golden body.
    c.lineCap = "round";
    this.line(
      [
        [-40, -31],
        [-58, -39],
        [-64, -58 + run * 4],
      ],
      "#d89a50",
      6,
    );
    this.ellipse(-64, -59 + run * 4, 6, 9, "#99522f");
    for (let i = 0; i < 4; i++) {
      const lx = -30 + i * 18;
      const swing = Math.sin(t * 14 + i * 2) * 9;
      this.line(
        [
          [lx, -27],
          [lx + swing, -15],
          [lx + swing + 6, -5],
        ],
        i % 2 ? "#de9b50" : "#a7653a",
        9,
      );
    }
    const body = c.createLinearGradient(0, -60, 0, 0);
    body.addColorStop(0, "#ffd387");
    body.addColorStop(1, "#c78441");
    this.ellipse(-4, -36, 44, 23, body);
    this.ellipse(35, -49, 27, 31, "#9c512e");
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * TAU;
      this.ellipse(
        35 + Math.cos(a) * 21,
        -49 + Math.sin(a) * 25,
        9,
        11,
        i % 2 ? "#b86532" : "#a35630",
      );
    }
    this.ellipse(40, -48, 18, 20, "#eeb36b");
    this.ellipse(40, -68, 7, 8, "#e9a45c");
    this.ellipse(53, -41, 12, 9, "#ffe0a0");
    this.ellipse(59, -45, 4, 3, "#3a2930");
    this.ellipse(47, -54, 2, 2.5, "#222333");
    this.line(
      [
        [52, -35],
        [57, -34],
      ],
      "#79442e",
      1.5,
    );
    // Tiny ringmaster with a teal coat, scarf, and top hat.
    this.line(
      [
        [-8, -62],
        [-14, -45],
        [-3, -43],
      ],
      "#223b49",
      8,
    );
    this.line(
      [
        [6, -61],
        [15, -48],
        [23, -49],
      ],
      "#284854",
      7,
    );
    c.fillStyle = "#62c3bb";
    c.beginPath();
    c.moveTo(-11, -91);
    c.lineTo(7, -91);
    c.lineTo(14, -64);
    c.lineTo(-14, -64);
    c.closePath();
    c.fill();
    this.line(
      [
        [-8, -84],
        [-23, -80],
        [-34, -89],
      ],
      "#77d4c9",
      5,
    );
    this.line(
      [
        [5, -85],
        [21, -91],
        [30, -108],
      ],
      "#77d4c9",
      5,
    );
    this.ellipse(30, -110, 3, 4, "#f4c69a");
    this.ellipse(-1, -102, 10, 12, "#f4c69a");
    this.ellipse(4, -104, 1.3, 1.6, "#343043");
    c.fillStyle = "#142d3a";
    c.fillRect(-12, -127, 19, 17);
    this.ellipse(-2, -110, 17, 4, "#17323d");
    c.fillStyle = "#eeb46b";
    c.fillRect(-12, -117, 19, 4);
    this.line(
      [
        [-8, -91],
        [2, -89],
        [14, -95],
        [24, -91 + run * 2],
      ],
      "#f78062",
      4,
    );
    c.restore();
  }
}
