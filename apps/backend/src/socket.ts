import { Server } from "socket.io";
import { Room } from "./room";

export default function setUpSocketListeners(io: Server, roomMap: Map<string, Room>) {
  io.on("connection", (socket) => {
    console.log(`User connected ${socket.id}`);

    // TODO: Define socket event handlers here

    socket.on("disconnect", () => {
      console.log(`User disconnected ${socket.id}`);
    });
  });

}
