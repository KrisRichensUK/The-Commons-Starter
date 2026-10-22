# The Commons Starter

A deliberately small, static starter for a public conversation space. It provides a calm thread-style interface, prompt deck, local posting and live local activity counts—without a CMS, accounts, analytics, BoundProof, AffixIO proofs, databases or external services.

![License: MIT](https://img.shields.io/badge/License-MIT-111111.svg)

## What is included

- Responsive, minimal conversation interface
- Browser-local posts using `localStorage`
- A small editable prompt deck
- Reply affordance and activity counters
- Accessible semantic HTML and no dependencies
- No telemetry, authentication, API keys or server required

## Quick start

Clone the repository and open `index.html` in a browser:

```bash
git clone https://github.com/YOUR-ORG/commons-starter.git
cd commons-starter
open index.html
```

For local development, any static server will work:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Make it yours

- Edit the `prompts` array in `app.js`.
- Change the copy and colours in `index.html` and `styles.css`.
- Replace `localStorage` functions in `app.js` with your own API calls when you need shared posts.
- Add your own authentication, moderation and privacy model before accepting public submissions.

## Important

This starter is intentionally **not** production-ready for public posting. It has no user authentication, server-side validation, moderation queue, rate limiting, persistence beyond one browser, or abuse protection. Do not treat browser-local demo data as secure.

## License

[MIT](LICENSE)
