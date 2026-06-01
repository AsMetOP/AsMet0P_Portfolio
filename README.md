# AsMetoP Portfolio — Deployment Guide

## Architecture

```
GitHub Pages  ──(static)──>  index.html  ──POST /api/chat──>  Vercel Function
                                                                    │
                                                                    ▼
                                                          Gemini API (key stays here)
```

- **Frontend** (`index.html`): hosted on GitHub Pages — no API key, no secrets.
- **Backend** (`api/chat.js`): Vercel serverless function — holds the Gemini API key as an environment variable.

---

## Folder Structure

```
portfolio/
├── index.html          ← Your portfolio (no API key inside)
├── cv.pdf              ← Your CV (add this file yourself)
├── vercel.json         ← Vercel routing config
├── api/
│   └── chat.js         ← Serverless function (Gemini proxy)
└── README.md
```

---

## Step 1 — Set Up GitHub Repository

1. Go to https://github.com/new and create a new **public** repository, e.g. `asmetop.github.io` or any name.
2. Push all the files in this folder to it:

```bash
cd portfolio
git init
git add .
git commit -m "Initial portfolio deployment"
git branch -M main
git remote add origin https://github.com/AsMetOP/<your-repo-name>.git
git push -u origin main
```

3. In the GitHub repo → **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main` → Folder: `/ (root)` → **Save**.

Your portfolio will be live at:  
`https://asmetop.github.io/<repo-name>/`  
(or `https://asmetop.github.io/` if the repo is named `asmetop.github.io`)

> **Add your CV:** Place `cv.pdf` in the root folder and push it. The iframe embed and download button will work automatically.

---

## Step 2 — Deploy Backend on Vercel

1. Go to https://vercel.com and sign in with GitHub.
2. Click **Add New Project** → Import your GitHub repo.
3. Vercel will auto-detect the `api/chat.js` function. Leave all build settings as default.
4. Click **Deploy**.

### Set the API Key Environment Variable

In your Vercel project dashboard:

1. Go to **Settings → Environment Variables**
2. Add:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** your Gemini API key (get one free at https://aistudio.google.com/app/apikey)
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development
3. Click **Save**, then go to **Deployments → Redeploy** (so the new env var takes effect).

Your backend will be live at something like:  
`https://your-project-name.vercel.app/api/chat`

---

## Step 3 — Connect Frontend to Backend

Open `index.html` and find this line near the top of the `<script>` block:

```js
const CHAT_API_URL = "/api/chat";
```

**Change it to your Vercel function URL:**

```js
const CHAT_API_URL = "https://your-project-name.vercel.app/api/chat";
```

Then commit and push:

```bash
git add index.html
git commit -m "Point frontend to Vercel backend"
git push
```

GitHub Pages will redeploy automatically within ~60 seconds.

---

## Step 4 — Enable CORS (if you see CORS errors)

If the browser blocks requests from GitHub Pages to Vercel, update `api/chat.js` — the function already handles `OPTIONS` preflight implicitly via Vercel, but if you see issues, add these headers at the top of the handler:

```js
res.setHeader('Access-Control-Allow-Origin', 'https://asmetop.github.io');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
if (req.method === 'OPTIONS') return res.status(200).end();
```

---

## What Changed vs the Original

| What | Before | After |
|------|--------|-------|
| Gemini API Key | Hardcoded in `index.html` | Environment variable on Vercel |
| AI requests | Browser → Gemini directly | Browser → Vercel `/api/chat` → Gemini |
| Visual design | ✅ Identical | ✅ Identical |
| Animations / globe | ✅ Identical | ✅ Identical |
| Offline fallback | ✅ Present | ✅ Present (used when backend unreachable) |
| Chat functionality | ✅ Working | ✅ Working (same UX) |

**Only 2 lines changed in `index.html`** — the `GEMINI_API_KEY` line and the fetch logic. Everything else is pixel-perfect identical.

---

## Local Development (Optional)

```bash
npm install -g vercel
vercel dev
```

This runs the serverless function locally on `http://localhost:3000/api/chat`.  
Set `CHAT_API_URL = "http://localhost:3000/api/chat"` temporarily for local testing.
