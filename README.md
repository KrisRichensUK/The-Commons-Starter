# The Commons Starter

A deliberately small, self-hostable starter for a public conversation space. It provides a calm thread-style interface, prompt deck, shared persistent posts and activity counts—without a CMS, accounts, analytics, BoundProof, AffixIO proofs or third-party services.

![License: MIT](https://img.shields.io/badge/License-MIT-111111.svg)

## What is included

- Responsive, minimal conversation interface
- Shared persistent posts when run with the included Node server
- Browser-local fallback when opened as a static demo
- A small editable prompt deck
- Reply affordance and activity counters
- Accessible semantic HTML and no dependencies
- No telemetry, authentication, API keys or dependencies

## Quick start

Clone the repository and start it with Node 20+:

```bash
git clone https://github.com/KrisRichensUK/The-Commons-Starter.git
cd The-Commons-Starter
node server.mjs
```

Then visit `http://localhost:3000`. Posts are stored in `data/posts.json`, which is created automatically and should be mounted to persistent storage when deploying.

To use it as a purely static visual demo instead, open `index.html` directly or use any static server:

```bash
python3 -m http.server 8080
```

In static-demo mode, posts live only in that browser's `localStorage`.

## Make it yours

- Edit the `prompts` array in `app.js`.
- Change the copy and colours in `index.htl` and `styles.css`.
- Replace the JSON-file store in `server.mjs` with a database when your community grows.
- Add authentication, moderation, reporting, rate limits apropriate to your traffic and a privacy model before accepting untrusted public submissions.

## Important

This starter is intentionally a **small reference implementation**, not a complete public-community platform. The included server has basic validation, a honeypot and in-memory rate limiting, but has no user accounts, moderator dashboard, reports, backups, CAPITCHA or robust abuse protection. Do not expose it widely without adding the controls your community needs.

## License

[MIT](LICENSE)
