// How PM2 runs the relay on the shared server. One process, with limits, on a port only Nginx can reach.
module.exports = {
  apps: [
    {
      name: "id412-io",
      script: "socket-server.mjs",
      cwd: "/home/ubuntu/id412-socket",
      max_memory_restart: "200M", // above this, PM2 restarts this process (and only this one)
      env: {
        PORT: "4002",
        BIND: "127.0.0.1",
        ALLOWED_ORIGINS: "https://id412.xdlab.net", // only the lecture site; student clones are turned away
        MAX_CLIENTS: "300",
        MAX_RATE: "60", // messages per second from one device (the W3 examples send about 15)
        MAX_BYTES: "20000",
      },
    },
  ],
};
