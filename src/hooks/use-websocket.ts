"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type WSMessage =
  | { type: "agent_reply"; agent: "skippy" | "snooks" | "meta"; content: string; timestamp: string }
  | { type: "momentum_alert"; score: number; reason: string; platform: string; timestamp: string }
  | { type: "opportunity"; title: string; url: string; platform: string; timestamp: string }
  | { type: "status"; message: string }
  | { type: "error"; message: string }
  | { type: "pong" };

type WSStatus = "connecting" | "connected" | "disconnected" | "error";

export function useAgentWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WSStatus>("disconnected");
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const [lastMomentumAlert, setLastMomentumAlert] = useState<Extract<WSMessage, { type: "momentum_alert" }> | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  };

  const connect = useCallback(() => {
    const token = getToken();
    if (!token) return;

    try {
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const url = `${proto}//${host}/backend/ws/main?token=${token}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;
      setStatus("connecting");

      ws.onopen = () => {
        setStatus("connected");
        pingRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping" }));
        }, 25000);
      };

      ws.onmessage = (evt) => {
        try {
          const msg: WSMessage = JSON.parse(evt.data);
          if (msg.type === "pong") return;
          setMessages((prev) => [msg, ...prev].slice(0, 200));
          if (msg.type === "momentum_alert") setLastMomentumAlert(msg);
        } catch {}
      };

      ws.onclose = () => {
        setStatus("disconnected");
        if (pingRef.current) clearInterval(pingRef.current);
        reconnectRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        setStatus("error");
        ws.close();
      };
    } catch {}
  }, []);

  const send = useCallback((payload: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectRef.current) clearTimeout(reconnectRef.current);
    if (pingRef.current) clearInterval(pingRef.current);
    wsRef.current?.close();
    setStatus("disconnected");
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { status, messages, lastMomentumAlert, send, disconnect };
}
