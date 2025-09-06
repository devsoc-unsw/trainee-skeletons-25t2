import { Server } from "socket.io";
import { RoomService, RoomServiceDependencies } from "./room.service";
import { RoomStore } from "./room.store";
import { RoomTimerQueue } from "./queue";
import { RestaurantService } from "../restaurants";

export { createRoomRouter } from "./room.routes";
export { setUpRoomSocketListeners, type SocketState } from "./room.sockets";
export { RoomService, RoomServiceDependencies } from "./room.service";
export { RoomStore } from "./room.store";
export { RoomTimerQueue, IRoomTimerQueue } from "./queue";

/**
 * Factory function to create a RoomService with all dependencies properly initialized
 * Use this in production code instead of manually constructing dependencies
 */
export function createRoomService(io: Server): RoomService {
  const roomStore = new RoomStore();
  const restaurantService = new RestaurantService();
  const timerQueue = new RoomTimerQueue(io, roomStore);

  return new RoomService({
    roomStore,
    restaurantService,
    timerQueue,
  });
}
