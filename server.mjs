import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT || 3000);
const ROOT = process.cwd();
const DATA_DIRECTORY = process.env.DATA_DIRECTORY || join(ROOT, "data");
const POSTS_FILE = join(DATA_DIRECTORY, "posts.json");
const MAX_BODY_BYTES = 32_000;
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml" };
const recentRequests = new Map();

const demoPosts = [
  { id: "welcome", author: "The Commons", topic: "Welcome", text: "This is a small starter for conversations that are worth coming back to. Add a thought, choose a prompt, and make it yours.", createdAt: Date.now() - 1_080_000 },
  { id: "river", author: "River", topic: "Everyday", text: "A good question can make an ordinary day feel much larger.", createdAt: Date.now() - 3_780_000 }
];

async function loadPosts() {
  if (!existsSync(POSTS_FILE)) return [...demoPosts];
  try {
    const posts = JSON.parse(await readFile(POSTS_FILE, "utf8"));
    return Array.isArray(posts) ? posts : [...demoPosts];
  } catch { return [...demoPosts]; }
}

async function savePosts(posts) {
  await mkdir(DATA_DIRECTORY, { recursive: true });
  await writeFile(POSTS_FILE, JSON.stringify(posts, null, 2) + "\n", "utf8");
}

function json(response, status, data) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" });
  response.end(JSON.stringify(data));
}

function clientAddress(request) {
  return String(request.headers["x-forwarded-for"] || request.socket.remoteAddress || "unknown").split(",")[0].trim();
}

function allowPost(request) {
  const key = clientAddress(request);
  const now = Date.now();
  const previous = (recentRequests.get(key) || []).filter((time) => time > now - 3_600_000);
  if (previous.length >= 20 || previous.at(-1) > now - 12_000) return false;
  previous.push(now); recentRequests.set(key, previous); return true;
}

function validText(value, minimum, maximum) {
  return typeof value === "string" && value.trim().length >= minimum && value.trim().length <= maximum;
}

function safeFilePath(urlPath) {
  const pathname = urlPath === "/" ? "/index.html" : urlPath;
  const filename = normalize(join(ROOT, pathname));
  return filename.startsWith(ROOT) ? filename : null;
}

async function requestBody(request) {
  const chunks = []; let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error("Request is too large.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  if (url.pathname === "/api/posts" && request.method === "GET") {
    const posts = await loadPosts();
    return json(response, 200, { posts: posts.sort((a, b) => b.createdAt - a.createdAt) });
  }
  if (url.pathname === "/api/posts" && request.method === "POST") {
    try {
      if (!allowPost(request)) return json(response, 429, { message: "Please wait before posting again." });
      const input = await requestBody(request);
      if (typeof input.website === "string" && input.website.trim()) return json(response, 400, { message: "Could not accept this post." });
      if (!validText(input.author, 1, 48) || !validText(input.text, 2, 2000) || (input.topic && !validText(input.topic, 1, 60))) return json(response, 400, { message: "Please provide a name and a message between 2 and 2,000 characters." });
      const post = { id: randomUUID(), author: input.author.trim(), topic: String(input.topic || "").trim(), text: input.text.trim(), replyTo: typeof input.replyTo === "string" ? input.replyTo : null, createdAt: Date.now() };
      const posts = await loadPosts(); posts.push(post); await savePosts(posts);
      return json(response, 201, { post });
    } catch (error) { return json(response, 400, { message: error.message === "Request is too large." ? error.message : "Please send a valid JSON post." }); }
  }
  if (request.method !== "GET" && request.method !== "HEAD") { response.writeHead(405); return response.end(); }
  const file = safeFilePath(url.pathname);
  if (!file) { response.writeHead(404); return response.end("Not found"); }
  try {
    const content = await readFile(file);
    response.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream", "x-content-type-options": "nosniff" });
    return response.end(request.method === "HEAD" ? undefined : content);
  } catch { response.writeHead(404); return response.end("Not found"); }
});

server.listen(PORT, () => console.log(`The Commons Starter: http://localhost:${PORT}`));
