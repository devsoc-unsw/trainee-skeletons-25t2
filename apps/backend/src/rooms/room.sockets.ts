import { DefaultEventsMap, Server } from "socket.io";
import { RoomService } from "./room.service";
import { config } from "../config";

export type SocketState = {
  userId: string;
  name: string;
  roomId: string;
};

export function setUpRoomSocketListeners(
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketState>,
  roomService: RoomService,
) {
  io.on("connection", (socket) => {
    // their userId and name is in the socket.handshake.query
    const userId = socket.handshake.query.userId as string;
    const name = socket.handshake.query.name as string;
    const roomId = socket.handshake.query.roomId as string;

    socket.data.userId = userId;
    socket.data.name = name;
    socket.data.roomId = roomId;

    socket.join(roomId);
    socket.data.roomId = roomId;
    io.in(roomId).emit("user:join", userId);

    if (config.nodeEnv !== "test") {
      console.log(
        `[${new Date().toISOString()}] User connected ${userId} ${name}`,
      );

      socket.onAny((event, ...args) => {
        console.log(`[${new Date().toISOString()}] [SOCKET] ${event}:`, {
          socketId: socket.id,
          userId,
          roomId,
          payload: args,
        });
      });
    }

    socket.on("room:leave", (roomId: string) => {
      try {
        roomService.removeUserFromRoom(roomId, userId);
        socket.leave(roomId);
        io.in(roomId).emit("user:leave", userId);
      } catch (error) {
        console.error(`Error leaving room ${roomId}:`, error);
      }
    });

    // change state of every User to be VOTING
    // add a guard here to check that the user calling is the owner of the room
    socket.on("room:startVoting", () => {
      try {
        roomService.startVoting(roomId, socket.data.userId);
        io.in(roomId).emit("game:state_update", "STARTED");
      } catch (error) {
        console.error(`Error starting voting in room ${roomId}:`, error);
      }
    });

    // moves every user to be "DONE state"
    // and changes the state of the room to be "FINISHED"
    socket.on("room:endVoting", () => {
      try {
        roomService.endVoting(roomId, socket.data.userId);
        io.in(roomId).emit("game:state_update", "ENDED");
      } catch (error) {
        console.error(`Error ending voting in room ${roomId}:`, error);
      }
    });

    // vote for a restaurant, vote must be: -1 or 1 or 2 (no, yes, superyes)
    socket.on(
      "room:voteRestaurant",
      (payload: { restaurantId: string; vote: number }) => {
        const { restaurantId, vote } = payload;
        try {
          const result = roomService.voteRestaurant(roomId, restaurantId, vote);
          io.in(roomId).emit("game:restaurant_voted", result);
        } catch (error) {
          console.error(
            `Error voting for restaurant in room ${roomId}:`,
            error,
          );
        }
      },
    );

    // when expiry date has passed, or every user is in DONE, get the top 5 restaurants according to
    // their votes.
    // TODO: May need to refactor to fit with current figma design
    socket.on("room:prepareResults", () => {
      try {
        const room = roomService.prepareResults(roomId);
        io.in(roomId).emit("syncState", room.toRoomResponse());
      } catch (error) {
        console.error(`Error preparing results for room ${roomId}:`, error);
      }
    });

    socket.on("disconnect", () => {
      // socket.io kicks out the user from every (socket) room they're in, but
      // user also needs to leave every room they're in (our roomService that is)
      // assume for now that the user is not in multiple rooms.

      // Check if room exists before trying to remove user
      const room = roomService.getRoom(roomId);
      if (room) {
        roomService.removeUserFromRoom(roomId, userId);
        io.in(roomId).emit("user:leave", userId);
      }
      socket.leave(roomId);

      if (config.nodeEnv !== "test") {
        console.log(
          `[${new Date().toISOString()}] User disconnected ${userId} ${name}`,
        );
      }
    });
  });
}
