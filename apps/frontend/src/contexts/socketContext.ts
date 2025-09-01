import { createContext } from "react";
import type { Socket } from "socket.io-client";

type SocketContextType = { socket: Socket | null };
export const SocketContext = createContext<SocketContextType>({ socket: null });
