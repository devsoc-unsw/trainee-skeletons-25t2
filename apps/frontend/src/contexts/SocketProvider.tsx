import React, { useEffect, useRef } from "react";
import { SocketContext } from "./socketContext";
import type { User } from "../types";
import { io, Socket } from "socket.io-client";

type SocketProviderProps = {
  user: User | null;
  children: React.ReactNode;
};

const URL = "http://localhost:3000";

export const SocketProvider: React.FC<SocketProviderProps> = ({
  user,
  children,
}) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    const { name, userId } = user;
    const socket = io(URL, { query: { name, userId } });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};
