// Screenshot a local route after the app has hydrated and settled.
// Usage: node scripts/shot.mjs <route> <out.png> [width] [height] [waitMs]
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [route = "/", out = "/tmp/shot.png", w = "1440", h = "900", waitMs = "5000"] =
  process.argv.slice(2);
const port = process.env.PORT ?? "43127";
const debugPort = 9400 + Math.floor(Math.random() * 400);
const profile = mkdtempSync(join(tmpdir(), "shot-"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn("google-chrome", [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--disable-dev-shm-usage",
  "--hide-scrollbars",
  "--force-device-scale-factor=1",
  `--window-size=${w},${h}`,
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profile}`,
  "about:blank",
]);

async function firstTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === "page");
      if (page) return page;
    } catch {
      // Not listening yet.
    }
    await sleep(250);
  }
  throw new Error("Chrome never exposed a page target");
}

try {
  const target = await firstTarget();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();

  const call = (method, params = {}) =>
    new Promise((resolve) => {
      const msgId = ++id;
      pending.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

  await new Promise((r) => ws.addEventListener("open", r));
  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data.result);
      pending.delete(data.id);
    }
  });

  await call("Page.enable");
  await call("Emulation.setDeviceMetricsOverride", {
    width: Number(w),
    height: Number(h),
    deviceScaleFactor: 1,
    mobile: false,
  });
  await call("Page.navigate", { url: `http://127.0.0.1:${port}${route}` });
  await sleep(Number(waitMs));

  // No captureBeyondViewport: resizing the viewport mid-capture makes
  // width-measuring components (charts) re-layout. Pass a tall window instead.
  const result = await call("Page.captureScreenshot", { format: "png" });
  writeFileSync(out, Buffer.from(result.data, "base64"));
  console.log(`wrote ${out}`);
} finally {
  chrome.kill("SIGKILL");
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 3 });
  } catch {
    // Chrome profile cleanup is best effort.
  }
  process.exit(0);
}
