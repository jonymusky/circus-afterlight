import { cp, mkdir, rm } from "node:fs/promises";
await rm("dist", { recursive: true, force: true });
await mkdir("dist");
for (const path of [
  "index.html",
  "favicon.svg",
  "src",
  "assets",
  "CNAME",
  "robots.txt",
  "sitemap.xml",
])
  await cp(path, `dist/${path}`, { recursive: true });
console.log("Built dist/ — static, dependency-free, GitHub Pages compatible.");
