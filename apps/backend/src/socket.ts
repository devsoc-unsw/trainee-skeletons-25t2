import { Server } from "socket.io";
import { Room } from "./room";

export function setUpSocketListeners(io: Server, roomMap: Map<string, Room>) {
  io.on("connection", (socket) => {
    console.log("User connected", socket.id);
  });
}
