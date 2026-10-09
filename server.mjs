import * as http from "node:http";
import { readFile } from "node:fs/promises";
import { request as httpsRequest } from "node:https";

const port = Number(process.env.PORT || 8765);
const host = "127.0.0.1";
const hasProxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;

if (hasProxy && http.setGlobalProxyFromEnv) {
  http.setGlobalProxyFromEnv(process.env);
  console.log("Using the configured environment proxy for OpenRouter requests.");
} else if (hasProxy) {
  console.warn("This Node.js version cannot use the configured proxy. Start with a newer Node.js release and --use-env-proxy.");
}

function send(res, status, message) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(message);
}

function proxy(req, res) {
  const path = new URL(req.url, "http://localhost").pathname + new URL(req.url, "http://localhost").search;
  const allowed = (req.method === "POST" && path === "/api/v1/videos") ||
    (req.method === "GET" && /^\/api\/v1\/videos\/[A-Za-z0-9_-]+(?:\/content(?:\?index=\d+)?)?$/.test(path));
  if (!allowed) return send(res, 404, "Not found");
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) return send(res, 401, "Missing bearer token");
  console.log(`${req.method} ${path}`);

  const upstream = httpsRequest({
    hostname: "openrouter.ai",
    path,
    method: req.method,
    headers: {
      Authorization: authorization,
      ...(req.headers["content-type"] ? { "Content-Type": req.headers["content-type"] } : {}),
      ...(req.headers["content-length"] ? { "Content-Length": req.headers["content-length"] } : {})
    }
  }, response => {
    res.writeHead(response.statusCode || 502, {
      ...(response.headers["content-type"] ? { "Content-Type": response.headers["content-type"] } : {}),
      ...(response.headers["content-length"] ? { "Content-Length": response.headers["content-length"] } : {})
    });
    response.pipe(res);
  });
  upstream.on("error", error => {
    console.error(`OpenRouter request failed: ${error.code || error.message}`);
    if (!res.headersSent) send(res, 502, error.message);
    else res.destroy(error);
  });
  req.pipe(upstream);
}

http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    res.end('{"ok":true}');
    return;
  }
  if (req.url === "/" || req.url === "/index.html") {
    try {
      const page = await readFile(new URL("./index.html", import.meta.url));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Content-Length": page.length });
      res.end(page);
    } catch {
      send(res, 500, "Unable to read the web console");
    }
    return;
  }
  if (req.url?.startsWith("/api/v1/videos")) return proxy(req, res);
  send(res, 404, "Not found");
}).listen(port, host, () => {
  console.log(`Frame Studio is running at http://${host}:${port}`);
});

