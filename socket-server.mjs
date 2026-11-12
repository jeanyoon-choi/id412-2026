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

const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("join", (room) => {
    socket.data.room = String(room);
    socket.join(socket.data.room);
  });

  socket.on("message", (message) => {
    if (!socket.data.room) return;
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
  server.listen(candidate, "0.0.0.0");
}
listen(port);
