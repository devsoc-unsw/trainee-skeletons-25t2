import React, { useEffect, useRef } from "react";
import { SocketContext } from "./SocketContext";
import type { User } from "../types";
import { io, Socket } from "socket.io-client";

type SocketProviderProps = {
  user: User;
  children: React.ReactNode;
};

const URL = "http://localhost:3000";

export const SocketProvider: React.FC<SocketProviderProps> = ({
  user,
  children,
}) => {
  const socketRef = useRef<Socket | null>(null);
  const { name, userId } = user;

  useEffect(() => {
    const socket = io(URL, { query: { name, userId } });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [name, userId]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};
