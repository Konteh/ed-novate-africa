// Collects browser console messages and page errors for a local route.
// Usage: node scripts/console-log.mjs /student?demo=student
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const route = process.argv[2] ?? "/";
const port = process.env.PORT ?? "43127";
const profile = mkdtempSync(join(tmpdir(), "cdp-"));

const chrome = spawn("google-chrome", [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--remote-debugging-port=9333",
  `--user-data-dir=${profile}`,
  "about:blank",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function targets() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch("http://127.0.0.1:9333/json/list");
      const list = await res.json();
      if (list.length) return list;
    } catch {
      // The browser is not listening yet.
    }
    await sleep(250);
  }
  throw new Error("no targets");
}

const cleanup = () => {
  chrome.kill("SIGKILL");
  rmSync(profile, { recursive: true, force: true });
};

try {
  const list = await targets();
  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
  const messages = [];
  let id = 0;
  const send = (method, params = {}) =>
    ws.send(JSON.stringify({ id: ++id, method, params }));

  ws.addEventListener("open", () => {
    send("Runtime.enable");
    send("Log.enable");
    send("Page.enable");
    send("Page.navigate", { url: `http://127.0.0.1:${port}${route}` });
  });

  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.method === "Runtime.consoleAPICalled") {
      messages.push(
        `[${data.params.type}] ` +
          data.params.args
            .map((a) => a.value ?? a.description ?? a.type)
            .join(" "),
      );
    }
    if (data.method === "Log.entryAdded") {
      messages.push(`[${data.params.entry.level}] ${data.params.entry.text}`);
    }
    if (data.method === "Runtime.exceptionThrown") {
      messages.push(
        `[exception] ${data.params.exceptionDetails.exception?.description ?? data.params.exceptionDetails.text}`,
      );
    }
  });

  await sleep(9000);
  console.log(messages.length ? messages.join("\n") : "No console output.");
} finally {
  cleanup();
  process.exit(0);
}
