// Socket.IO relay. Devices join a room; every message is forwarded to the
// other devices in the same room. Runs over http by default (`pnpm dev`, pages
// on http://localhost:3000). With `--https` (`pnpm dev:mobile`) it reuses the
// certificates that `next dev --experimental-https` generates, because an
// https page can only talk to an https relay.

import { existsSync, readFileSync } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { networkInterfaces } from "node:os";
import { Server } from "socket.io";

const port = Number(process.env.PORT) || 4000;
const keyPath = "certificates/localhost-key.pem";
const certPath = "certificates/localhost.pem";

// In `pnpm dev:mobile` Next may still be generating the certificates.
async function waitForCertificates(ms = 20_000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    if (existsSync(keyPath) && existsSync(certPath)) return true;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

const handler = (req, res) => {
  // Any page may ask "are you the relay?" (useSocket does, to find the port).
  res.writeHead(200, { "content-type": "text/plain", "access-control-allow-origin": "*" });
  res.end("socket relay ok\n");
};

const secure = process.argv.includes("--https") && (await waitForCertificates());
const server = secure
  ? createHttpsServer({ key: readFileSync(keyPath), cert: readFileSync(certPath) }, handler)
  : createHttpServer(handler);

// On a shared server (see docs/relay-deployment.md) the relay sets limits, so that it cannot
// disturb the other programs on that computer. On your laptop none of these are set: no limits.
//   ALLOWED_ORIGINS  pages that may connect, comma-separated (unset = any page)
//   MAX_CLIENTS      devices connected at once (unset = no limit)
//   MAX_RATE         messages per second from one device (unset = no limit)
//   MAX_BYTES        size of one message (unset = Socket.IO's own 1 MB)
const allowed = process.env.ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim());
const maxClients = Number(process.env.MAX_CLIENTS) || Infinity;
const maxRate = Number(process.env.MAX_RATE) || Infinity;

const io = new Server(server, {
  cors: { origin: allowed ?? "*" },
  // A browser always says which page it comes from; a page that is not on the list is turned away.
  allowRequest: (request, decide) => decide(null, !allowed || allowed.includes(request.headers.origin)),
  ...(process.env.MAX_BYTES ? { maxHttpBufferSize: Number(process.env.MAX_BYTES) } : {}),
});

io.on("connection", (socket) => {
  if (io.engine.clientsCount > maxClients) return socket.disconnect(true); // full

  socket.on("join", (room) => {
    socket.data.room = String(room).slice(0, 64);
    socket.join(socket.data.room);
  });

  // Count this device's messages second by second; above the limit they are dropped, not queued.
  let second = 0;
  let count = 0;
  socket.on("message", (message) => {
    if (!socket.data.room) return;
    const now = Math.floor(Date.now() / 1000);
    if (now !== second) [second, count] = [now, 0];
    if (++count > maxRate) return;
    socket.to(socket.data.room).emit("message", message);
  });
});

server.on("listening", () => {
  const protocol = secure ? "https" : "http";
  const used = server.address().port;
  const lan = Object.values(networkInterfaces())
    .flat()
    .filter((net) => net && net.family === "IPv4" && !net.internal)
    .map((net) => `${protocol}://${net.address}:${used}`);
  console.log(`socket relay on ${protocol}://localhost:${used}`);
  for (const url of lan) console.log(`  phone: ${url}`);
});

// Another program may already use the port (a second project's relay, for example).
// Then try the next one, up to 3 times: 4000 → 4001 → 4002 → 4003. useSocket looks in the same order.
// On a host that sets PORT (Render, Railway) there is only that one port.
let tries = process.env.PORT ? 0 : 3;
function listen(candidate) {
  server.once("error", (error) => {
    if (error.code !== "EADDRINUSE" || tries === 0) throw error;
    tries -= 1;
    console.log(`port ${candidate} is used by another program → trying ${candidate + 1}`);
    listen(candidate + 1);
  });
  server.listen(candidate, process.env.BIND ?? "0.0.0.0"); // BIND=127.0.0.1 on a shared server: only Nginx reaches it
}
listen(port);
