const http = require("node:http");
const { readFile } = require("node:fs/promises");
const path = require("node:path");

const files = {
  "/": { file: "index.html", contentType: "text/html; charset=utf-8" },
  "/index.html": { file: "index.html", contentType: "text/html; charset=utf-8" },
  "/styles.css": { file: "styles.css", contentType: "text/css; charset=utf-8" },
};

const port = Number(process.env.PORT || 10000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

const server = http.createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  let pathname;
  try {
    pathname = new URL(request.url, "http://localhost").pathname;
  } catch (error) {
    response.writeHead(400);
    response.end("Bad Request");
    return;
  }

  const entry = files[pathname];
  if (!entry) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not Found");
    return;
  }

  let content;
  try {
    content = await readFile(path.join(__dirname, entry.file));
  } catch (error) {
    console.error(`Failed to read ${entry.file}:`, error);
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Internal Server Error");
    return;
  }

  response.writeHead(200, {
    "Content-Type": entry.contentType,
    "Content-Length": content.length,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(request.method === "HEAD" ? undefined : content);
});

server.on("error", (error) => {
  console.error("Web server failed:", error);
  process.exit(1);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Kenako Aquatics listening on port ${port}`);
});
