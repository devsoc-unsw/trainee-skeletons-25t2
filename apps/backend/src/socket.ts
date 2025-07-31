import { Server } from "socket.io";

export function setUpSocketListeners(io: Server) {
  io.on("connection", (socket) => {
    console.log("User connected", socket.id);
  });
}
