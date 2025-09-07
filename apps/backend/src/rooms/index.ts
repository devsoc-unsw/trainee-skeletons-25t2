import { Server } from "socket.io";
import { RoomService } from "./room.service";
import { RoomStore } from "./room.store";
import { TimerQueue } from "./queue";
import { RestaurantService } from "../restaurants";

export { createRoomRouter } from "./room.controller";
export { setUpRoomSocketListeners, type SocketState } from "./room.sockets";
export { RoomService } from "./room.service";
export { RoomStore } from "./room.store";
export { TimerQueue } from "./queue";

/**
 * Factory function to create a RoomService with all dependencies properly initialized
 * Use this in production code instead of manually constructing dependencies
 */
export function createRoomService(io: Server): RoomService {
  const roomStore = new RoomStore();
  const restaurantService = new RestaurantService();
  const timerQueue = new TimerQueue(io, roomStore);

  return new RoomService(roomStore, restaurantService, timerQueue);
}
