# The relay of the deployed site (instructor only)

The deployed site, https://id412.xdlab.net, runs on Vercel. Vercel cannot run the relay, so the relay of the deployed site runs on a server the instructor already has (an AWS EC2 instance in Seoul, shared with other projects). Students do not use it: their relay runs on their laptop, or on Render / Railway (lecture notes, W2 §7).

## What is where

| | |
|---|---|
| Address | `https://id412-socket.xdlab.net` (an A record at GoDaddy, pointing at the server) |
| On the server | folder `/home/ubuntu/id412-socket`, PM2 process `id412-io`, port `127.0.0.1:4002` |
| Nginx | `/etc/nginx/sites-available/id412-socket` (copy: `deploy/relay/nginx-id412-socket.conf`), certificate by certbot |
| The site | Vercel project, environment variable `NEXT_PUBLIC_SOCKET_URL=https://id412-socket.xdlab.net` |
| In this repo | `socket-server.mjs` (the same file that runs on a laptop), `deploy/relay/` (what the server needs), `scripts/deploy-relay.mjs` |
| Not in this repo | `.env.deploy` (git-ignored): `RELAY_HOST=ubuntu@<address>`, `RELAY_KEY=/path/to/key.pem` |

## Updating the relay

After changing `socket-server.mjs` or `deploy/relay/`:

```
pnpm deploy:relay
```

It copies three files (`socket-server.mjs`, `package.json`, `ecosystem.config.cjs`) into the relay's folder, installs socket.io there, restarts `id412-io` and checks that it answers. Success ends with `socket relay ok`.

Changes to pages (`app/`) do not need this: Vercel deploys them.

## The limits

On the server the relay runs with limits, set in `deploy/relay/ecosystem.config.cjs`, so that it cannot disturb the other projects on that computer:

- `ALLOWED_ORIGINS`: only pages of `https://id412.xdlab.net` may connect. A student's clone on its own address is turned away.
- `MAX_RATE` 60 messages a second per device, `MAX_BYTES` 20 kB per message, `MAX_CLIENTS` 300 devices.
- PM2 restarts the process above 200 MB of memory.

On a laptop none of these are set, and the relay behaves as before.

## Separate from the other projects

The same server runs two other relays: `banpo-io` (port 4000) and `scc-io` (port 4001), each with its own folder, process, Nginx site and certificate. This relay has its own of each.

- Never restart, edit or redeploy `banpo-io` or `scc-io` from here, and never edit their Nginx sites.
- Never open port 4002 to the outside: only Nginx reaches it.
- Changing Nginx, DNS, certificates, the server's firewall or the Vercel variable is not part of `pnpm deploy:relay`. Ask the instructor first.
- If `pnpm deploy:relay` fails, report the error. Do not try to repair the server.

## Rooms

All visitors of the deployed site share the rooms (`"drawing"`, `"fish-food"`, …). That is what the W3 examples want: many mobiles, one screen.
