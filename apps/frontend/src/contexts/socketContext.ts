import { createContext } from "react";
import type { Socket } from "socket.io-client";

export type SocketContextType = {
  socket: Socket | null;
  connectToRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  isConnected: boolean;
};

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  connectToRoom: () => {},
  leaveRoom: () => {},
  isConnected: false,
});
