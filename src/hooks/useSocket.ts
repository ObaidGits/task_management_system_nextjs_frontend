// src/hooks/useSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useSocket = (userId?: string): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });
    setSocket(s);

    s.on("connect", () => {
      console.log("✅ Socket connected:", s.id);
      if (userId) {
        console.log("📡 Emitting register for user", userId);
        s.emit("register", userId);
      }
    });

    s.on("disconnect", () => console.log("⚠️ Socket disconnected"));
    s.on("connect_error", (err) => console.error("❌ Socket error:", err.message));

    return () => { s.disconnect(); };
  }, [userId]);

  return socket;
};
