import { DefaultEventsMap, Server } from "socket.io";
import { User } from "../rooms/room";
import { RoomService } from "../rooms/room.service";

export default function setUpSocketListeners(
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, User>,
) {
  const roomService = new RoomService();
  io.on("connection", (socket) => {
    // their userId and name is in the socket.handshake.query
    const userId = socket.handshake.query.userId as string;
    const name = socket.handshake.query.name as string;
    socket.data.userId = userId;
    socket.data.name = name;

    console.log(`User connected ${userId} ${name}`);

    // TODO: Define socket event handlers here
    socket.on("room:create", (payload: { roomId: string }) => {
      const { roomId } = payload;
      const room = roomService.createRoom(roomId, { userId, name });
      socket.join(roomId);

      // This should get returned to the frontend, we want to use "syncState" to sync up the state of our backend
      // to the frontend in real-time.
      io.in(roomId).emit("syncState", room.toObject());
    });

    socket.on("room:join", (payload: { roomId: string}) => {
      const { roomId } = payload

      socket.join(roomId)

      const room = roomService.getRoom(roomId)
      if (room === undefined) {
        throw Error(`room with roomId ${roomId} could not be found`)
      } 
      room.addUser({ userId, name })
      io.in(roomId).emit("syncState", room.toObject());
    });

    socket.on("room:leave", (payload: { roomId: string }) => {
      const { roomId } = payload
      
      const room = roomService.getRoom(roomId)
      if (room === undefined) {
        throw Error(`room with roomId ${roomId} could not be found`)
      } 
      room.removeUser({userId, name})
      io.in(roomId).emit("syncState", room.toObject());
      
      // sync before the socket leaves so that it has the room object.
      socket.leave(roomId)
    });

    socket.on("disconnect", () => {
      // socket.io kicks out the user from every (socket) room they're in, but
      // user also needs to leave every room they're in (our roomService that is)
      roomService.disconnectUser({userId, name})
      // io.in(roomId).emit("syncState", room.toObject());
      console.log(`User disconnected ${userId} ${name}`);
    });
  });
}
