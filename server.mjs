import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist");
const port = Number(process.env.PORT || 8080);
const backend = (process.env.GLIP_BACKEND_URL || "").replace(/\/$/, "");
const version = process.env.GLIP_RELEASE_ID || "1.0.0rc7";

const types = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
};

function security(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' https: data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
}

function publicOrigin(req) {
  const proto = String(req.headers["x-forwarded-proto"] || "https")
    .split(",")[0]
    .trim();

  const host = String(
    req.headers["x-forwarded-host"] || req.headers.host || ""
  )
    .split(",")[0]
    .trim();

  return host ? `${proto}://${host}` : "";
}

async function proxy(req, res) {
  if (!backend) {
    security(res);
    res.writeHead(503, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({ detail: "glip_backend_url_not_configured" })
    );
  }

  const target = new URL(req.url || "/", backend);

  // Public commercial consultation has a strict ingress limit even before proxying.
  // Other authenticated API contracts remain unchanged.
  const limitedCommercialRequest =
    target.pathname === "/api/v1/public/commercial/assessment" ||
    target.pathname === "/api/v1/public/agent/chat";
  const commercialBodyLimit = target.pathname === "/api/v1/public/agent/chat" ? 8192 : 4096;
  const declaredLength = req.headers["content-length"];
  if (limitedCommercialRequest && declaredLength !== undefined &&
      (!/^\d+$/.test(String(declaredLength)) || Number(declaredLength) > commercialBodyLimit)) {
    // Drain rather than terminate the socket while a client may still be uploading.
    req.resume();
    security(res);
    res.writeHead(413, {"Content-Type": "application/json", "Cache-Control": "no-store"});
    return res.end(JSON.stringify({detail: "commercial_payload_too_large"}));
  }
  const chunks = [];
  let bodySize = 0;
  for await (const chunk of req) {
    bodySize += chunk.length;
    if (limitedCommercialRequest && bodySize > commercialBodyLimit) {
      security(res);
      res.writeHead(413, {"Content-Type": "application/json", "Cache-Control": "no-store"});
      return res.end(JSON.stringify({detail: "commercial_payload_too_large"}));
    }
    chunks.push(chunk);
  }
  const body = chunks.length ? Buffer.concat(chunks) : undefined;

  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;

    const lower = key.toLowerCase();

    if (
      [
        "host",
        "content-length",
        "connection",
        "transfer-encoding",
        "accept-encoding",
      ].includes(lower)
    ) {
      continue;
    }

    if (Array.isArray(value)) {
      headers.set(key, value.join(", "));
    } else {
      headers.set(key, String(value));
    }
  }

  headers.set("Accept-Encoding", "identity");

  const origin = publicOrigin(req);

  if (origin) {
    const parsedOrigin = new URL(origin);
    headers.set("X-Forwarded-Proto", parsedOrigin.protocol.replace(":", ""));
    headers.set("X-Forwarded-Host", parsedOrigin.host);
  }

  let upstream;

  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method || "GET") ? undefined : body,
      redirect:"manual",
    });
  } catch {
    security(res);
    res.writeHead(502, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ detail: "glip_backend_unreachable" }));
  }

  security(res);

  for (const [key, value] of upstream.headers.entries()) {
    const lower = key.toLowerCase();

    if (
      [
        "content-length",
        "content-encoding",
        "transfer-encoding",
        "connection",
        "set-cookie",
      ].includes(lower)
    ) {
      continue;
    }

    res.setHeader(key, value);
  }

  const cookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : upstream.headers.get("set-cookie")
        ? [upstream.headers.get("set-cookie")]
        : [];

  if (cookies.length) {
    res.setHeader("Set-Cookie", cookies);
  }

  const location = upstream.headers.get("location");

  if (location) {
    res.setHeader("Location", location);
  }

  res.statusCode = upstream.status;

  const data = Buffer.from(await upstream.arrayBuffer());
  res.end(data);
}

function serve(req, res) {
  const u = new URL(req.url || "/", "http://localhost");
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(u.pathname);
  } catch {
    security(res);
    res.writeHead(400);
    return res.end();
  }
  let filePath = path.resolve(root, "." + decodedPath);
  const relative = path.relative(root, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    security(res);
    res.writeHead(403);
    return res.end();
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(root, "index.html");
  }

  security(res);
  const extension = path.extname(filePath);
  const video = extension === ".mp4";
  const stats = fs.statSync(filePath);
  res.setHeader("Content-Type", types[extension] || "application/octet-stream");
  res.setHeader(
    "Cache-Control",
    filePath.endsWith("index.html") ? "no-store" :
      video ? "public, max-age=3600, must-revalidate" :
      "public,max-age=31536000,immutable"
  );

  if (!["GET", "HEAD"].includes(req.method || "GET")) {
    res.writeHead(405, {Allow: "GET, HEAD"});
    return res.end();
  }

  if (video) {
    res.setHeader("Accept-Ranges", "bytes");
    const range = req.headers.range;
    if (range !== undefined) {
      // Only support a single byte interval. Reject malformed and multi-ranges.
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      let start = 0;
      let end = stats.size - 1;
      let valid = Boolean(match) && stats.size > 0;
      if (valid) {
        const left = match[1], right = match[2];
        if (!left && !right) {
          valid = false;
        } else if (!left) {
          const suffix = Number(right);
          valid = Number.isSafeInteger(suffix) && suffix > 0;
          if (valid) start = Math.max(0, stats.size - suffix);
        } else {
          start = Number(left);
          valid = Number.isSafeInteger(start) && start < stats.size;
          if (right) {
            end = Number(right);
            valid = valid && Number.isSafeInteger(end) && end >= start;
          }
          end = Math.min(end, stats.size - 1);
        }
      }
      if (!valid) {
        res.writeHead(416, {"Content-Range": `bytes */${stats.size}`, "Content-Length": "0"});
        return res.end();
      }
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stats.size}`,
        "Content-Length": String(end - start + 1),
      });
      if (req.method === "HEAD") return res.end();
      return fs.createReadStream(filePath, {start, end}).pipe(res);
    }
  }
  res.setHeader("Content-Length", String(stats.size));
  res.writeHead(200);
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(filePath).pipe(res);
}

http
  .createServer(async (req, res) => {
    const u = new URL(req.url || "/", "http://localhost");

    if(u.pathname==="/health"){
      security(res);
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });

      return res.end(
        JSON.stringify({
          status: "ok",
          service: "glip-frontend",
          version,
          backend_proxy_configured: Boolean(backend),
          deployment_id: process.env.RAILWAY_DEPLOYMENT_ID || null,
          commit: process.env.RAILWAY_GIT_COMMIT_SHA || null,
        })
      );
    }

    if (u.pathname.startsWith("/api/")) {
      return proxy(req, res);
    }

    return serve(req, res);
  })
  .listen(port, "0.0.0.0", () => {
    console.log(`GLIP frontend ${port}`);
  });
