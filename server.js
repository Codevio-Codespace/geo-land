/* ==========================================================================
   Geo&Land — zero-dependency local server
   Serves the static site and injects .env values at /assets/js/env.js so the
   browser can talk to Supabase. Run:  npm start   (or: node server.js)
   ========================================================================== */

"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;

/* ---------- .env parsing (re-read on every env.js request) ---------- */
function loadEnv() {
  const file = path.join(ROOT, ".env");
  const out = {};
  if (!fs.existsSync(file)) return out;

  fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .forEach(function (line) {
      const m = line.match(/^\s*([A-Za-z0-9_.-]+)\s*=\s*(.*)\s*$/);
      if (!m) return;
      let value = (m[2] || "").trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      out[m[1]] = value;
    });

  return out;
}

/* ---------- mime types ---------- */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4"
};

/* ---------- server ---------- */
const server = http.createServer(function (req, res) {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);

  /* Dynamic environment file — reflects .env without a restart */
  if (urlPath === "/assets/js/env.js") {
    const env = loadEnv();
    const body =
      "/* Served by server.js from .env — do not edit this response. */\n" +
      "window.GEOLAND_ENV = " +
      JSON.stringify(
        {
          SUPABASE_URL: env.SUPABASE_URL || "",
          SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY || ""
        },
        null,
        2
      ) +
      ";\n";
    res.writeHead(200, {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store"
    });
    res.end(body);
    return;
  }

  /* Static files */
  let rel = urlPath;
  if (rel === "/" || rel === "") rel = "/index.html";
  if (rel.endsWith("/")) rel += "index.html";

  const filePath = path.normalize(path.join(ROOT, rel));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, function (err, stat) {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 — Not found: " + rel);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

/* OS environment overrides .env, which overrides the default */
const PORT = process.env.PORT || parseInt(loadEnv().PORT, 10) || 8080;

server.listen(PORT, function () {
  const env = loadEnv();
  const configured = !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
  console.log("");
  console.log("  Geo&Land dev server running");
  console.log("  → Website:  http://localhost:" + PORT + "/");
  console.log("  → Admin:    http://localhost:" + PORT + "/admin.html");
  console.log("  → Supabase: " + (configured ? "configured (" + env.SUPABASE_URL + ")" : "NOT configured — edit .env"));
  console.log("");
});
