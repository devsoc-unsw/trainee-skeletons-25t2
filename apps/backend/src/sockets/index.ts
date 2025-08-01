import { DefaultEventsMap, Server } from "socket.io";
import { User } from "../rooms/room";
import { RoomService } from "../rooms/room.service";

export default function setUpSocketListeners(
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, User>,
) {
  const roomService = new RoomService();
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;
    const name = socket.handshake.query.name as string;
    socket.data.userId = userId;
    socket.data.name = name;

    console.log(`User connected ${userId} ${name}`);

    // TODO: Define socket event handlers here
    socket.on("room:create", (payload: { roomId: string }) => {
      const { roomId } = payload;
      const room = roomService.createRoom(roomId, { userId, name })
      socket.join(roomId);

      // This should get returned to the frontend, we want to use "syncState" to sync up the state of our backend
      // to the frontend in real-time.
      io.in(roomId).emit("syncState", room.toObject());
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected ${userId} ${name}`);
    });
  });
}
