const STORAGE_KEY = "the-commons-starter-posts-v1";

const prompts = [
  { category: "Everyday", text: "What small habit has made the biggest difference to your day?" },
  { category: "Future", text: "What should we preserve as technology changes everything else?" },
  { category: "Ideas", text: "What is a useful question that people do not ask often enough?" },
  { category: "Stories", text: "Tell us about a moment that changed your mind." },
  { category: "Making", text: "What are you building, learning or quietly improving?" },
  { category: "Nature", text: "What have you noticed recently that made you slow down?" }
];

const demoPosts = [
  { id: "welcome", author: "The Commons", topic: "Welcome", text: "This is a small starter for conversations that are worth coming back to. Add a thought, choose a prompt, and make it yours.", createdAt: Date.now() - 1000 * 60 * 18 },
  { id: "river", author: "River", topic: "Everyday", text: "A good question can make an ordinary day feel much larger.", createdAt: Date.now() - 1000 * 60 * 63 }
];

const byId = (id) => document.getElementById(id);
const escapeText = (value) => String(value ?? "");
let replyTo = null;

function readPosts() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [...demoPosts];
  } catch {
    return [...demoPosts];
  }
}

function writePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function relativeTime(timestamp) {
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

function renderStats(posts) {
  byId("post-count").textContent = posts.length;
  byId("contributor-count").textContent = new Set(posts.map((post) => post.author.trim().toLowerCase())).size;
  byId("prompt-count").textContent = prompts.length;
}

function renderFeed() {
  const posts = readPosts().sort((a, b) => b.createdAt - a.createdAt);
  const feed = byId("feed");
  feed.replaceChildren();

  for (const post of posts) {
    const item = document.createElement("article");
    item.className = "message";

    const header = document.createElement("div");
    header.className = "message-header";
    const author = document.createElement("span");
    author.className = "message-name";
    author.textContent = escapeText(post.author);
    const topic = document.createElement("span");
    topic.className = "message-topic";
    topic.textContent = post.topic ? `· ${escapeText(post.topic)}` : "";
    const time = document.createElement("time");
    time.className = "message-time";
    time.textContent = relativeTime(post.createdAt);
    header.append(author, topic, time);

    const text = document.createElement("p");
    text.className = "message-text";
    text.textContent = escapeText(post.text);

    const footer = document.createElement("div");
    footer.className = "message-footer";
    const reply = document.createElement("button");
    reply.type = "button";
    reply.className = "reply-button";
    reply.textContent = "Reply";
    reply.addEventListener("click", () => startReply(post));
    footer.append(reply);

    item.append(header, text, footer);
    feed.append(item);
  }
  renderStats(posts);
}

function startReply(post) {
  replyTo = post;
  byId("replying-to").textContent = `Replying to ${post.author}`;
  byId("topic").value = post.topic || "";
  byId("message").focus();
}

function renderPrompts() {
  const list = byId("prompt-list");
  list.replaceChildren();
  for (const prompt of prompts) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "prompt-card";
    const category = document.createElement("span");
    category.textContent = prompt.category;
    const text = document.createElement("strong");
    text.textContent = prompt.text;
    button.append(category, text);
    button.addEventListener("click", () => {
      byId("topic").value = prompt.category;
      byId("message").value = prompt.text;
      byId("message").focus();
      byId("conversation").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    list.append(button);
  }
}

byId("post-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const author = byId("author").value.trim();
  const topic = byId("topic").value.trim();
  const text = byId("message").value.trim();
  if (author.length < 1 || text.length < 2) return;

  const prefix = replyTo ? `Replying to ${replyTo.author}: ` : "";
  const posts = readPosts();
  posts.push({ id: crypto.randomUUID(), author, topic, text: prefix + text, createdAt: Date.now() });
  writePosts(posts);
  event.currentTarget.reset();
  replyTo = null;
  byId("replying-to").textContent = "";
  renderFeed();
});

byId("reset-demo").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  replyTo = null;
  byId("replying-to").textContent = "";
  renderFeed();
});

byId("random-prompt").addEventListener("click", () => {
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];
  byId("topic").value = prompt.category;
  byId("message").value = prompt.text;
  byId("conversation").scrollIntoView({ behavior: "smooth", block: "start" });
  byId("message").focus();
});

renderPrompts();
renderFeed();
