# id412-2026

KAIST ID412 Interactive Space — Web Workshop (Web 1–3). Lecture notes and in-class code.

Lecture notes: https://id412.xdlab.net

## Setup

Requires Node 24+ and pnpm.

1. GitHub: **Use this template** → create your own repository
2. `git clone <your repository>`
3. `pnpm install`
4. `pnpm dev` → http://localhost:3000

## Scripts

| Script            | What it does                                                                 |
| ----------------- | ---------------------------------------------------------------------------- |
| `pnpm dev`        | Next.js on http://localhost:3000. Enough for W1 and single-device work.      |
| `pnpm dev:mobile` | Next.js over HTTPS on all interfaces + socket relay on port 4000. For phones. |
| `pnpm build`      | Production build (what Vercel runs).                                         |
| `pnpm typecheck`  | `tsc --noEmit`.                                                              |

`pnpm dev:mobile` generates a self-signed certificate into `certificates/` on first run. On the phone, open both `https://<laptop-ip>:3000` and `https://<laptop-ip>:4000` once and pass the warning. See W2 notes, A3.

## Structure

```
app/
  page.tsx                 index
  lecture/{prelim,w1,w2,w3}/page.mdx
  experiments/w1/ w2/ w3/  in-class code, one folder per experiment
  final/page.tsx           your final project
hooks/useSocket.ts         useSocket(room, onMessage) → { send, connected }
socket-server.mjs          Socket.IO relay (port 4000)
AGENTS.md                  rules for your coding agent
```

- An experiment is a folder with `page.tsx` (+ `*.module.css`): `app/experiments/w1/<name>/page.tsx` → `/experiments/w1/<name>`.
- Multi-device experiments use two routes: `app/experiments/w2/<name>/mobile/page.tsx` and `.../screen/page.tsx`, both calling `useSocket("<name>", ...)`.

## From experiment to final

1. Copy the experiment folder's contents into `app/final/` (`page.tsx`, `*.module.css`, any components it uses).
2. For multi-device: `app/final/mobile/page.tsx` and `app/final/screen/page.tsx`.
3. Rename the socket room to something unique (`useSocket("final-yourname", ...)`).
4. `pnpm typecheck` and `pnpm build` must pass before you push. Vercel builds the whole app.

## Deploy

Push to GitHub → Vercel → Import → Deploy. The deployed site has no socket relay: multi-device work runs from your laptop with `pnpm dev:mobile`.
