const http = require("node:http");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const root = __dirname;
const dataDir = path.join(root, "data");
const workspaceDir = path.join(dataDir, "workspaces");
const legacyDataFile = path.join(dataDir, "carecircle-state.json");
const defaultWorkspace = normalizeWorkspaceId(process.env.CARECIRCLE_DEFAULT_WORKSPACE || "demo-family");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";
const clientsByWorkspace = new Map();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8"
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const workspaceRoute = parseWorkspaceRoute(url.pathname);

    if (workspaceRoute) {
      await handleWorkspaceRoute(workspaceRoute, request, response);
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/state") {
      await sendState(defaultWorkspace, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/state") {
      await saveState(defaultWorkspace, request, response);
      return;
    }

    if (request.method === "GET" && url.pathname === "/events") {
      openEventStream(defaultWorkspace, request, response);
      return;
    }

    if (request.method !== "GET") {
      response.writeHead(405, { Allow: "GET, POST" });
      response.end("Method not allowed");
      return;
    }

    await sendStatic(url.pathname, response);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(`Server error: ${error.message}`);
  }
});

server.listen(port, host, () => {
  console.log(`CareCircle beta server is running at http://localhost:${port}`);
  console.log(`Demo workspace: http://localhost:${port}?workspace=${defaultWorkspace}`);
  for (const address of getLanAddresses()) {
    console.log(`Mobile on same Wi-Fi: http://${address}:${port}?workspace=${defaultWorkspace}`);
  }
});

async function handleWorkspaceRoute(route, request, response) {
  if (route.resource === "state" && request.method === "GET") {
    await sendState(route.workspaceId, response);
    return;
  }

  if (route.resource === "state" && request.method === "POST") {
    await saveState(route.workspaceId, request, response);
    return;
  }

  if (route.resource === "events" && request.method === "GET") {
    openEventStream(route.workspaceId, request, response);
    return;
  }

  response.writeHead(405, { Allow: "GET, POST" });
  response.end("Method not allowed");
}

async function sendState(workspaceId, response) {
  let body = "{}";

  try {
    body = await fsp.readFile(stateFileFor(workspaceId), "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    if (workspaceId === defaultWorkspace) {
      body = await readLegacyState();
    }
  }

  response.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(body);
}

async function saveState(workspaceId, request, response) {
  const raw = await readBody(request);
  const parsed = JSON.parse(raw);
  const state = {
    ...parsed,
    meta: {
      ...(parsed.meta || {}),
      workspaceId,
      updatedAt: new Date().toISOString()
    }
  };

  await fsp.mkdir(workspaceDir, { recursive: true });
  await fsp.writeFile(stateFileFor(workspaceId), JSON.stringify(state, null, 2));
  broadcastStateChange(workspaceId);

  response.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify({ ok: true, workspaceId }));
}

function openEventStream(workspaceId, request, response) {
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*"
  });
  response.write(": connected\n\n");

  if (!clientsByWorkspace.has(workspaceId)) {
    clientsByWorkspace.set(workspaceId, new Set());
  }

  const clients = clientsByWorkspace.get(workspaceId);
  clients.add(response);

  request.on("close", () => {
    clients.delete(response);
  });
}

function broadcastStateChange(workspaceId) {
  const clients = clientsByWorkspace.get(workspaceId);
  if (!clients) return;

  for (const client of clients) {
    client.write(`event: state\ndata: ${Date.now()}\n\n`);
  }
}

async function sendStatic(pathname, response) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const decoded = decodeURIComponent(safePath).replace(/^\/+/, "");
  const filePath = path.normalize(path.join(root, decoded));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  const extension = path.extname(filePath);
  const contentType = contentTypes[extension] || "application/octet-stream";

  fs.createReadStream(filePath)
    .on("open", () => {
      const alwaysFresh = [".html", ".js", ".css", ".webmanifest"].includes(extension);
      response.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": alwaysFresh ? "no-store" : "public, max-age=600"
      });
    })
    .on("error", () => {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    })
    .pipe(response);
}

function parseWorkspaceRoute(pathname) {
  const match = pathname.match(/^\/api\/workspaces\/([^/]+)\/(state|events)$/);
  if (!match) return null;

  return {
    workspaceId: normalizeWorkspaceId(match[1]),
    resource: match[2]
  };
}

function normalizeWorkspaceId(value) {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return normalized || "demo-family";
}

function stateFileFor(workspaceId) {
  return path.join(workspaceDir, `${workspaceId}.json`);
}

async function readLegacyState() {
  try {
    return await fsp.readFile(legacyDataFile, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return "{}";
  }
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        request.destroy();
        reject(new Error("Request body too large"));
      }
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function getLanAddresses() {
  const addresses = [];
  const interfaces = os.networkInterfaces();

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family === "IPv4" && !entry.internal) {
        addresses.push(entry.address);
      }
    }
  }

  return addresses;
}
