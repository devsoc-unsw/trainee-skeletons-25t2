import { DefaultEventsMap, Server } from "socket.io";
import { Restaurant, User } from "../types";
import { RoomService } from "../rooms/room.service";
import { getUnswRestaurants } from "../services/unsw.service";

export type SocketState = {
  userId: string;
  name: string;
  roomId: string | null;
};

export default function setUpSocketListeners(
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketState>,
) {
  const roomService = new RoomService();
  io.on("connection", (socket) => {
    // their userId and name is in the socket.handshake.query
    const userId = socket.handshake.query.userId as string;
    const name = socket.handshake.query.name as string;
    socket.data.userId = userId;
    socket.data.name = name;
    socket.data.roomId = null;

    console.log(`User connected ${userId} ${name}`);

    // TODO: Define socket event handlers here
    socket.on("room:create", (payload: { roomId: string }) => {
      const { roomId } = payload;
      const room = roomService.createRoom(roomId, { userId, name, userState: "WAITING"});
      socket.join(roomId);
      socket.data.roomId = roomId;

      // This should get returned to the frontend, we want to use "syncState" to sync up the state of our backend
      // to the frontend in real-time.
      io.in(roomId).emit("syncState", room.toObject());
    });

    socket.on("room:join", (payload: { roomId: string }) => {
      const { roomId } = payload;

      socket.join(roomId);
      socket.data.roomId = roomId;

      const room = roomService.getRoom(roomId);
      if (room === undefined) {
        throw Error(`room with roomId ${roomId} could not be found`);
      }
      room.addUser({ userId, name, userState: "WAITING" });
      io.in(roomId).emit("syncState", room.toObject());
    });

    socket.on("room:leave", (payload: { roomId: string }) => {
      const { roomId } = payload;

      const room = roomService.getRoom(roomId);
      if (room === undefined) {
        throw Error(`room with roomId ${roomId} could not be found`);
      }
      room.removeUser(userId);
      io.in(roomId).emit("syncState", room.toObject());

      // sync before the socket leaves so that it has the room object.
      socket.leave(roomId);
    });

    // change state of every User to be VOTING
    // add a guard here to check that the user calling is the owner of the room
    socket.on("room:startVoting", () => {
      const roomId = socket.data.roomId;
      
      if (roomId === null) {
        throw Error(`roomId on socket ${socket.data.userId} could not be found`);
      }

      const room = roomService.getRoom(roomId);
      if (room === undefined) {
        throw Error(`room with roomId ${roomId} could not be found`);
      }

      const ownerId = room.owner.userId;
      if (ownerId !== socket.data.userId) {
        throw Error(`userId ${socket.data.userId} is not the owner of the room, cannot start voting`);
      }

      room.startVoting();
      io.in(roomId).emit("syncState", room.toObject());
    });

    // TODO:
    // given some details return a list of Restaurants:
    // this might be an API endpoint instead but for now stub as a websocket event
    socket.on("room:findRestaurants", () => {
    });

    // TODO:
    // vote for a restaurant, vote must be: -1 or 1 or 2
    socket.on("room:voteRestaurant", (payload: { restaurantId: string, vote: number}) => {
      const { restaurantId, vote } = payload;
      console.log(`voting for ${restaurantId} with vote ${vote}`);

      const roomId = socket.data.roomId;
      if (roomId === null) {
        throw Error(`roomId on socket ${socket.data.userId} could not be found`);
      }

      const room = roomService.getRoom(roomId);
      if (room === undefined) {
        throw Error(`room with roomId ${roomId} could not be found`);
      }

      room.voteRestaurant(restaurantId, vote);
      io.in(roomId).emit("syncState", room.toObject());
    });

    socket.on("room:addRestaurant", (payload: { restaurant: Restaurant }) => {
      const { restaurant } = payload;

      const roomId = socket.data.roomId;
      if (roomId === null) {
        throw Error(`roomId on socket ${socket.data.userId} could not be found`);
      }

      const room = roomService.getRoom(roomId);
      if (room === undefined) {
        throw Error(`room with roomId ${roomId} could not be found`);
      }

      room.addRestaurant(restaurant);
      io.in(roomId).emit("syncState", room.toObject());
    });

    // TODO:
    // when expiry date has passed, or every user is in DONE, get the top 5 restaurants according to 
    // their votes.
    socket.on("room:prepareResults", () => {
    });

    socket.on("disconnect", () => {
      // socket.io kicks out the user from every (socket) room they're in, but
      // user also needs to leave every room they're in (our roomService that is)
      // assume for now that the user is not in multiple rooms.
      // roomService.disconnectUser({userId, name})

      // remove the user from the room as well
      if (socket.data.roomId !== null) {
        const roomId = socket.data.roomId;
        const room = roomService.getRoom(socket.data.roomId);

        if (room !== undefined) {
          room.removeUser(userId);
          io.in(roomId).emit("syncState", room.toObject());
        }
      }

      console.log(`User disconnected ${userId} ${name}`);
    });
  });
}
