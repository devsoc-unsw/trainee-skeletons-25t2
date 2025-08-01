import React, { createContext, useContext, useEffect } from "react";
import { socket } from "../utils/socket";

// TODO: can modify/remove this context, this is here to just test the socket connection
const SocketContext = createContext(socket);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
