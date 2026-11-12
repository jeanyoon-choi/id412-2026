// Instructor only: puts socket-server.mjs on the shared server and restarts the id412 relay there.
// Students do not need this: their relay runs on their laptop, or on Render / Railway (lecture notes W2 §7).
// Run: pnpm deploy:relay        What it touches and what it never touches: docs/relay-deployment.md
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

// Where the server is and which key opens it are not in the repo. They are in .env.deploy (git-ignored):
//   RELAY_HOST=ubuntu@<address>
//   RELAY_KEY=/path/to/key.pem
if (!existsSync(".env.deploy")) {
  console.error("No .env.deploy: this command is for the instructor's server. See docs/relay-deployment.md.");
  process.exit(1);
}
const settings = Object.fromEntries(
  readFileSync(".env.deploy", "utf8")
    .split("\n")
    .filter((line) => line.includes("=") && !line.startsWith("#"))
    .map((line) => [line.slice(0, line.indexOf("=")).trim(), line.slice(line.indexOf("=") + 1).trim()]),
);
const { RELAY_HOST: host, RELAY_KEY: key } = settings;
if (!host || !key || !existsSync(key)) {
  console.error(".env.deploy needs RELAY_HOST and RELAY_KEY (an existing key file).");
  process.exit(1);
}

const ROOT = "/home/ubuntu/id412-socket"; // this relay's own folder on the server
const NAME = "id412-io"; // this relay's own process
const PORT = 4002; // this relay's own port
const ssh = ["-i", key, "-o", "BatchMode=yes", "-o", "ConnectTimeout=10"];

function run(command, parts) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, parts, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${command} stopped with code ${code}`))));
  });
}
const remote = (script) => run("ssh", [...ssh, host, script]);

// 1. The folder.
await remote(`mkdir -p ${ROOT}`);

// 2. Three files: the relay, what it depends on, how PM2 runs it. Nothing else of the repo goes up.
await run("rsync", ["-az", "-e", `ssh ${ssh.join(" ")}`, "socket-server.mjs", "deploy/relay/package.json", "deploy/relay/ecosystem.config.cjs", `${host}:${ROOT}/`]);

// 3. Install socket.io there (quick when nothing changed), check the file, (re)start only this process.
await remote(
  [
    `cd ${ROOT}`,
    "npm install --omit=dev --no-audit --no-fund",
    "node --check socket-server.mjs",
    `pm2 startOrRestart ecosystem.config.cjs --only ${NAME} --update-env`,
    "pm2 save", // so it comes back after a reboot
  ].join(" && "),
);

// 4. Is it answering?
await remote(`for attempt in 1 2 3 4 5 6 7 8 9 10; do curl -fsS http://127.0.0.1:${PORT}/ && exit 0; sleep 1; done; echo "the relay does not answer on ${PORT}"; exit 1`);
console.log(`\n${NAME} is running on ${PORT}.`);
