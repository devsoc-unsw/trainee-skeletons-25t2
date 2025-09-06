import React, { useEffect, useRef, useState, useCallback } from "react";
import { SocketContext } from "./socketContext";
import type { User } from "../types";
import { io, Socket } from "socket.io-client";
import { config } from "../config";

type SocketProviderProps = {
  user: User | null;
  children: React.ReactNode;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({
  user,
  children,
}) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const currentRoomRef = useRef<string | null>(null);

  const connectToRoom = useCallback(
    (roomId: string) => {
      if (!user) return;

      // If already connected to the same room, don't reconnect
      if (socketRef.current && currentRoomRef.current === roomId) {
        return;
      }

      // Disconnect from previous room if connected to a different one
      if (socketRef.current && currentRoomRef.current !== roomId) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      const { name, userId } = user;
      const socket = io(config.serverUrl, {
        query: { name, userId, roomId },
      });

      socket.on("connect", () => {
        setIsConnected(true);
        currentRoomRef.current = roomId;
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
        currentRoomRef.current = null;
      });

      socketRef.current = socket;
    },
    [user],
  );

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      currentRoomRef.current = null;
    }
  }, []);

  const leaveRoom = useCallback(
    (roomId: string) => {
      if (socketRef.current && currentRoomRef.current === roomId) {
        socketRef.current.emit("room:leave", roomId);
      }
      disconnect();
    },
    [disconnect],
  );

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  useEffect(() => {
    if (!user && socketRef.current) {
      disconnect();
    }
  }, [user, disconnect]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connectToRoom,
        leaveRoom,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
