import { useContext } from "react";
import { SocketContext, type SocketContextType } from "./socketContext";

/**
 * Exposes the socket.io connection to the component for defining event handling logic
 * and emitting events.
 *
 * @throws {Error} if not called within a SocketProvider
 */
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
