# GitHub Repo Explorer

> Studio Graphene — Full Stack Developer Assessment, **Exercise 3**.

A full-stack web app where you **sign up / log in**, then type a GitHub username
and instantly see that person's public profile and repositories.
**The browser never talks to GitHub directly** — every request is proxied through
a Node.js/Express backend that caches responses (to dodge GitHub's rate limit)
and is the right place to attach a server-side API token in a real deployment.

The app ships with a polished, responsive UI, a **light / dark theme toggle**
(remembers your choice and respects your OS preference), and **JWT-based
authentication** that gates the explorer.

---

## Live Demo

| | URL |
| --- | --- |
| Frontend | _add your Vercel/Netlify link here_ |
| Backend  | _add your Render/Railway link here_ |
| Health check | `GET <backend>/api/health` |

> Not yet deployed. The app runs locally with the steps below.

---

## Tech Stack

Everything is written in **plain JavaScript** (no TypeScript) with modern ES modules.

| Layer | Choice | Why |
| --- | --- | --- |
| Backend | **Node.js + Express** | Minimal, well-understood, easy to read. |
| Auth | **JWT** (`jsonwebtoken`) + **bcryptjs** | Stateless tokens + salted password hashing — the standard, dependency-light approach. |
| HTTP | **Native `fetch`** (Node 18+) | No need for axios — the platform now ships a capable client. |
| Cache | **In-memory TTL cache** (custom, ~40 lines) | The brief only needs a 60s window; a Map with expiry is simpler than pulling in Redis. |
| User store | **JSON file** (`server/data/users.json`) | The brief allows a JSON file; users persist across restarts. |
| Frontend | **React 18 + Vite** | Fast dev server, instant HMR. Functional components + hooks throughout (no class components). |
| Styling | **Tailwind CSS v4** | Utility-first with semantic design tokens; theming is done by swapping CSS variables, so light/dark needs no per-element overrides. |
| Fonts | **Inter** | A clean, highly legible UI typeface with a tightened type scale. |
| Chart | **Recharts** | Accessible donut chart for the language breakdown. Lazy-loaded so it never bloats the initial bundle. |
| Tests | **Vitest + Supertest** | 21 backend tests covering the cache, the pure transforms, the GitHub proxy, and the full auth flow. |

---

## Features

**Authentication** ✅ sign up, log in, log out · passwords hashed with bcrypt ·
JWT stored client-side and validated on load · all GitHub routes require a valid
token · expired tokens log you out automatically.

**Theme** ✅ light + dark toggle · persisted in `localStorage` · defaults to your
OS preference · no flash of wrong theme on load.

**Explorer — Must have** ✅ username search · full profile (avatar, name, bio,
followers, following, public repo count) · repo list (name, description, language,
stars, last-updated) · sort by stars / name / last-updated · clear "user not found"
error · graceful network + rate-limit handling.

**Explorer — Should have** ✅ 60s server-side cache · loading skeletons ·
"load more" pagination · click-to-expand repo details (open issues, default
branch, watchers, license, topics, homepage).

**Explorer — Bonus** ✅ recently-searched list in `localStorage` · language
breakdown donut chart · debounced search-as-you-type · accessible markup (ARIA
roles, keyboard focus rings, `prefers-reduced-motion`) · code-split chart bundle.

---

## How to Run Locally

> Assumes only **Node.js ≥ 18** is installed. The app is a monorepo with two
> independent packages: `server` and `client`. You'll need **two terminals**.

### 1. Backend

```bash
cd server
cp .env.example .env        # set JWT_SECRET; optionally add a GITHUB_TOKEN
npm install
npm run dev                 # starts the API on http://localhost:4000
```

### 2. Frontend (in a second terminal)

```bash
cd client
npm install
npm run dev                 # starts the app on http://localhost:5173
```

Open **http://localhost:5173**, create an account, then search for a username
(try `torvalds`).

> In development, Vite proxies `/api` → `http://localhost:4000`, so the browser
> only ever talks to one origin and there are **no CORS issues**.

### Run the tests

```bash
cd server
npm test                    # 21 tests, all passing
```

### Optional: a GitHub token

Unauthenticated GitHub allows **60 requests/hour per IP**. Add a token to
`server/.env` to raise that to **5,000/hour**:

```env
GITHUB_TOKEN=ghp_your_classic_token_no_scopes_needed
```

The token is read **only on the server** and is never sent to the browser.

---

## API Documentation

Base URL: `http://localhost:4000`. All responses are JSON. Errors share one
shape: `{ "error": { "message": string, ...extra } }`.

### Auth

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | `{ name, email, password }` | `password` ≥ 8 chars. Returns `{ user, token }` (201). |
| `POST` | `/api/auth/login` | `{ email, password }` | Returns `{ user, token }`. |
| `GET` | `/api/auth/me` | — | Requires `Authorization: Bearer <token>`. Returns `{ user }`. |

`user` shape: `{ id, name, email, createdAt }` — the password hash is never returned.

### GitHub proxy (all require `Authorization: Bearer <token>`)

#### `GET /api/github/users/:username`
```json
{ "profile": { "login": "...", "name": "...", "avatarUrl": "...", "bio": null,
  "htmlUrl": "...", "company": "...", "location": "...", "blog": "...",
  "followers": 0, "following": 0, "publicRepos": 0, "createdAt": "..." },
  "meta": { "cached": false } }
```

#### `GET /api/github/users/:username/repos`
Query: `sort=stars|name|updated`, `direction=asc|desc`, `page` (≥1), `perPage` (1–100, default 12).
The backend fetches the full repo set once, caches it, then sorts / paginates /
aggregates languages server-side.
```json
{ "items": [ { "id": 1, "name": "...", "description": null, "language": "C",
  "stars": 0, "forks": 0, "watchers": 0, "openIssues": 0, "defaultBranch": "main",
  "topics": [], "isFork": false, "isArchived": false, "license": null,
  "htmlUrl": "...", "pushedAt": "...", "updatedAt": "...", "createdAt": "..." } ],
  "pagination": { "page": 1, "perPage": 12, "total": 11, "totalPages": 1,
    "hasNextPage": false, "hasPrevPage": false },
  "languages": [ { "name": "C", "count": 9 } ],
  "meta": { "cached": false, "truncated": false } }
```

### Error responses

| Status | When |
| --- | --- |
| `400` | Invalid input (bad username, weak password, missing fields) |
| `401` | Missing/invalid/expired token, or wrong login credentials |
| `404` | GitHub user doesn't exist |
| `409` | Signup with an email that already exists |
| `429` | GitHub rate limit hit (includes `resetAt`) |
| `502` | GitHub unreachable or returned an unexpected status |
| `500` | Unexpected server error (no stack leaked) |

---

## Project Structure

```
github-repo-explorer/
├── server/                      # Node.js + Express API (plain JS, ES modules)
│   ├── src/
│   │   ├── config/env.js         # validated environment config (one place)
│   │   ├── utils/                # ApiError, TTL cache, async handler
│   │   ├── services/
│   │   │   ├── github.service.js     # cached fetch + pagination + rate-limit handling
│   │   │   ├── repos.transform.js    # pure sort / paginate / aggregate helpers
│   │   │   ├── auth.service.js       # signup/login, bcrypt hashing, JWT issuing
│   │   │   └── users.store.js        # JSON-file user persistence
│   │   ├── middleware/
│   │   │   ├── auth.js               # requireAuth — verifies bearer token
│   │   │   └── errorHandler.js       # 404 + central error envelope
│   │   ├── controllers/          # github + auth request handlers
│   │   ├── routes/               # github + auth routers
│   │   ├── app.js                # builds the Express app (testable)
│   │   └── index.js              # server bootstrap
│   ├── data/                    # users.json created here at runtime (git-ignored)
│   └── tests/                   # Vitest: cache, transforms, github API, auth API (21 tests)
│
└── client/                      # React + Vite + Tailwind (plain JS / JSX)
    └── src/
        ├── api/client.js        # fetch wrapper: attaches token, handles 401 globally
        ├── context/
        │   ├── AuthContext.jsx   # session state, login/signup/logout
        │   └── ThemeContext.jsx  # light/dark theme + persistence
        ├── hooks/
        │   ├── useGithubExplorer.js  # owns explorer async state, cancels stale requests
        │   ├── useDebounce.js        # debounced search-as-you-type
        │   └── useRecentSearches.js  # localStorage-backed recent list
        ├── lib/                 # number/date formatting + language colours
        ├── components/          # AuthScreen, Header, SearchBar, ProfileCard,
        │                        #   RepoCard, LanguageChart, ThemeToggle, ...
        ├── App.jsx              # providers + auth gate
        └── main.jsx
```

---

## Notes & Honesty

- **Auth scope.** The brief says auth isn't required for Exercise 3; it was added
  on request. It's a real, working JWT flow (hashed passwords, token validation,
  protected routes) but intentionally lightweight — no email verification,
  refresh tokens, or password reset.
- **Sorting strategy.** GitHub's repos endpoint can't sort by stars, so the
  backend fetches the full repo set once, caches it, and sorts / paginates /
  aggregates itself. Users with more than `MAX_REPOS` (default 300) repos get a
  `truncated` flag and the UI says so.
- **Single-process state.** Both the cache and the JSON user store are per-process
  — fine for this demo; a real multi-instance deploy would use Redis + a database.
- I wrote all of this myself and understand every line; happy to walk through any
  part of it in the follow-up.

---

## Next Steps (with more time)

- **Deploy** backend (Render) + frontend (Vercel) and wire `VITE_API_BASE_URL`.
- **Refresh tokens** and password reset for a production-grade auth flow.
- **Move the user store to SQLite** and the cache to Redis for multi-instance support.
- **Frontend tests** (React Testing Library) for the auth and search flows.
- **ETag / conditional requests** to GitHub so cache refreshes don't burn rate limit.
```
