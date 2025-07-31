import { Server } from "socket.io";
import { Room } from "../room";

export default function setUpSocketListeners(io: Server, roomMap: Map<string, Room>) {
  io.on("connection", (socket) => {
    console.log(`User connected ${socket.id}`);

    // TODO: Define socket event handlers here
    // UserId can probably be stored in the socket data, will figure this out later
    socket.on("room:create", (payload: { roomId: string, userId: string }) => {
      const { roomId, userId } = payload;
      roomMap.set(roomId, new Room(roomId, userId));
      socket.join(roomId);

      // This should get returned to the frontend, we want to use "syncState" to sync up the state of our backend
      // to the frontend in real-time. also we use the spread operator here to serialize te room class into an object
      io.in(roomId).emit("syncState", { ...roomMap.get(roomId) });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected ${socket.id}`);
    });
  });

}
