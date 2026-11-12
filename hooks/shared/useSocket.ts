"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

type Message = { type: string; data?: unknown };
type Handler = (type: string, data: unknown) => void;

// The relay normally listens on port 4000. If another program already uses 4000,
// socket-server.mjs moves up to 4001, 4002 or 4003: so ask each one "are you the relay?".
const PORTS = [4000, 4001, 4002, 4003];
const RETRY = 2000; // ms between two searches while no relay answers

async function findRelay() {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
  const host = `${window.location.protocol}//${window.location.hostname}`;
  for (const port of PORTS) {
    try {
      const response = await fetch(`${host}:${port}/`, { signal: AbortSignal.timeout(1500) });
      if ((await response.text()).startsWith("socket relay ok")) return `${host}:${port}`;
    } catch {
      // nothing of ours on this port: try the next one
    }
  }
  return null;
}

// What to tell the person in front of the page when no relay answers.
function notFoundMessage() {
  const { protocol, hostname } = window.location;
  if (protocol === "https:") {
    return `no relay at https://${hostname}:4000 — open that address once on this device and accept the warning (is pnpm dev:mobile running?)`;
  }
  return "no relay on ports 4000–4003 — start it with pnpm dev";
}

/**
 * Joins `room` on the relay (socket-server.mjs).
 * `send(type, data)` forwards a message to every other device in the same room.
 * `onMessage(type, data)` is called for every message another device sent.
 * `connected` is true while the relay is reachable; `status` says so in words,
 * or says what is wrong: show it on the page.
 */
export function useSocket(room: string, onMessage?: Handler) {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("connecting…");
  const socketRef = useRef<Socket | null>(null);
  const handlerRef = useRef<Handler | undefined>(onMessage);

  useEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let socket: Socket | null = null;
    let timer = 0;
    let cancelled = false; // set by the cleanup, in case it runs before the relay is found

    async function connect() {
      const url = await findRelay();
      if (cancelled) return;
      if (!url) {
        // No relay yet: say why, and look again in a moment (it may be starting).
        setStatus(notFoundMessage());
        timer = window.setTimeout(connect, RETRY);
        return;
      }

      socket = io(url);
      socketRef.current = socket;

      socket.on("connect", () => {
        socket!.emit("join", room);
        setConnected(true);
        setStatus(`connected · ${url.replace(/^https?:\/\//, "")}`);
      });
      socket.on("disconnect", () => {
        setConnected(false);
        setStatus("relay disconnected — reconnecting…");
      });
      socket.on("connect_error", (error) => {
        setConnected(false);
        setStatus(`cannot reach the relay at ${url} — ${error.message}`);
      });
      socket.on("message", (message: Message) => {
        handlerRef.current?.(message.type, message.data);
      });
    }
    connect();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [room]);

  const send = useCallback((type: string, data?: unknown) => {
    socketRef.current?.emit("message", { type, data });
  }, []);

  return { send, connected, status };
}
