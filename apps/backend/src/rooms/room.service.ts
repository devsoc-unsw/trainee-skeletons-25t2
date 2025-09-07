import { Room } from "./room";
import { User } from "../types";
import {
  Restaurant,
  RestaurantSearchParams,
  RestaurantService,
} from "../restaurants";
import { RoomStore } from "./room.store";
import { v4 as uuidv4 } from "uuid";
import { TimerQueue } from "./queue";
import { GameState } from "./room.types";

/**
 * Factory function to create a RoomService with all dependencies properly initialized
 * Use this in production code instead of manually constructing dependencies
 */
export function createRoomService(
  roomEvent: (roomId: string, gameState: GameState) => void,
): RoomService {
  const roomStore = new RoomStore();
  const restaurantService = new RestaurantService();

  const handleVotingEnded = (roomId: string, gameState: GameState) => {
    roomStore.endVotingInRoom(roomId);
    roomEvent(roomId, gameState);
  };
  const timerQueue = new TimerQueue(handleVotingEnded);

  return new RoomService(roomStore, restaurantService, timerQueue);
}

export class RoomService {
  constructor(
    private readonly roomStore: RoomStore,
    private readonly restaurantService: RestaurantService,
    private readonly timerQueue: TimerQueue,
  ) {
    this.roomStore = roomStore;
    this.restaurantService = restaurantService;
    this.timerQueue = timerQueue;
  }

  /**
   * Create a new room with the given owner and search parameters
   */
  async createRoomWithSearch(
    owner: User,
    searchParams: RestaurantSearchParams,
    endDate?: Date,
  ): Promise<Room> {
    const restaurants =
      await this.restaurantService.searchRestaurants(searchParams);
    return this.roomStore.createRoom(owner, restaurants, endDate);
  }

  /**
   * Create a new room with the given owner and restaurants
   */
  createRoom(owner: User, restaurants?: Restaurant[], endDate?: Date): Room {
    return this.roomStore.createRoom(owner, restaurants, endDate);
  }

  /**
   * Get a room by its code
   */
  getRoom(roomId: string): Room | undefined {
    return this.roomStore.getRoomById(roomId);
  }

  /**
   * Join a user to an existing room
   */
  joinRoom(roomCode: string, userName: string): { user: User; room: Room } {
    const room = this.roomStore.getRoomByCode(roomCode);
    if (!room) {
      throw new Error("Room not found");
    }

    const newUser: User = {
      userId: uuidv4(),
      name: userName.trim(),
      userState: "WAITING",
    };

    this.roomStore.addUserToRoom(room.id, newUser);
    return { user: newUser, room };
  }

  /**
   * Start voting in a room (only owner can do this)
   */
  startVoting(roomId: string, userId: string): void {
    const room = this.roomStore.getRoomById(roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.owner.userId !== userId) {
      throw new Error("Only the room owner can start voting");
    }

    this.roomStore.startVotingInRoom(roomId);
    this.timerQueue.scheduleRoomEnd(roomId, room.endDate);
  }

  /**
   * End voting in a room (only owner can do this)
   */
  endVoting(roomId: string, userId: string): void {
    const room = this.roomStore.getRoomById(roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.owner.userId !== userId) {
      throw new Error("Only the room owner can end voting");
    }

    this.roomStore.endVotingInRoom(roomId);
    this.timerQueue.cancelRoomEnd(roomId);
  }

  /**
   * Vote for a restaurant in a room
   */
  voteRestaurant(
    roomId: string,
    restaurantId: string,
    vote: number,
  ): { restaurantId: string; newVoteCount: number; gameState: string } {
    const room = this.roomStore.getRoomById(roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    this.roomStore.voteRestaurantInRoom(roomId, restaurantId, vote);
    return {
      restaurantId,
      newVoteCount: room.restaurantVotes.get(restaurantId) ?? 0,
      gameState: room.gameState,
    };
  }

  /**
   * Prepare results for a room (only when game is finished)
   */
  prepareResults(roomId: string): Room {
    const room = this.roomStore.getRoomById(roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.gameState !== "FINISHED") {
      throw new Error("Cannot prepare results, game is not finished");
    }

    this.roomStore.prepareResultsInRoom(roomId);
    return room;
  }

  /**
   * Remove a user from a room
   */
  removeUserFromRoom(roomId: string, userId: string): void {
    const room = this.roomStore.getRoomById(roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    this.roomStore.removeUserFromRoom(roomId, userId);
  }

  /**
   * Delete a room
   */
  deleteRoom(roomId: string): boolean {
    this.timerQueue.cancelRoomEnd(roomId);
    return this.roomStore.deleteRoom(roomId);
  }

  /**
   * Get all rooms (for testing purposes)
   */
  getRooms(): Map<string, Room> {
    return this.roomStore.getRooms();
  }
}
