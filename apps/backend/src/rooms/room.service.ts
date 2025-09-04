import { Room } from "./room";
import { User } from "../types";
import { Restaurant, RestaurantSearchParams } from "./room.types";
import { RestaurantService } from "./restaurant.service";
import { RoomStore } from "./room.store";
import { v4 as uuidv4 } from "uuid";

export class RoomService {
  private roomStore: RoomStore;
  private restaurantService: RestaurantService;

  constructor(roomStore?: RoomStore, restaurantService?: RestaurantService) {
    this.roomStore = roomStore || new RoomStore();
    this.restaurantService = restaurantService || new RestaurantService();
  }

  /**
   * Create a new room with the given owner and search parameters
   */
  async createRoomWithSearch(
    owner: User,
    searchParams: RestaurantSearchParams,
  ): Promise<Room> {
    const restaurants =
      await this.restaurantService.searchRestaurants(searchParams);
    return this.roomStore.createRoom(owner, restaurants);
  }

  /**
   * Create a new room with the given owner and restaurants
   */
  createRoom(owner: User, restaurants?: Restaurant[]): Room {
    return this.roomStore.createRoom(owner, restaurants);
  }

  /**
   * Get a room by its code
   */
  getRoom(roomCode: string): Room | undefined {
    return this.roomStore.getRoom(roomCode);
  }

  /**
   * Join a user to an existing room
   */
  joinRoom(roomCode: string, userName: string): { user: User; room: Room } {
    const room = this.roomStore.getRoom(roomCode);
    if (!room) {
      throw new Error("Room not found");
    }

    const newUser: User = {
      userId: uuidv4(),
      name: userName.trim(),
      userState: "WAITING",
    };

    this.roomStore.addUserToRoom(roomCode, newUser);
    return { user: newUser, room };
  }

  /**
   * Start voting in a room (only owner can do this)
   */
  startVoting(roomCode: string, userId: string): void {
    const room = this.roomStore.getRoom(roomCode);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.owner.userId !== userId) {
      throw new Error("Only the room owner can start voting");
    }

    this.roomStore.startVotingInRoom(roomCode);
  }

  /**
   * End voting in a room (only owner can do this)
   */
  endVoting(roomCode: string, userId: string): void {
    const room = this.roomStore.getRoom(roomCode);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.owner.userId !== userId) {
      throw new Error("Only the room owner can end voting");
    }

    this.roomStore.endVotingInRoom(roomCode);
  }

  /**
   * Vote for a restaurant in a room
   */
  voteRestaurant(
    roomCode: string,
    restaurantId: string,
    vote: number,
  ): { restaurantId: string; newVoteCount: number; gameState: string } {
    const room = this.roomStore.getRoom(roomCode);
    if (!room) {
      throw new Error("Room not found");
    }

    this.roomStore.voteRestaurantInRoom(roomCode, restaurantId, vote);
    return {
      restaurantId,
      newVoteCount: room.restaurantVotes.get(restaurantId) ?? 0,
      gameState: room.gameState,
    };
  }

  /**
   * Prepare results for a room (only when game is finished)
   */
  prepareResults(roomCode: string): Room {
    const room = this.roomStore.getRoom(roomCode);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.gameState !== "FINISHED") {
      throw new Error("Cannot prepare results, game is not finished");
    }

    this.roomStore.prepareResultsInRoom(roomCode);
    return room;
  }

  /**
   * Remove a user from a room
   */
  removeUserFromRoom(roomCode: string, userId: string): void {
    const room = this.roomStore.getRoom(roomCode);
    if (!room) {
      throw new Error("Room not found");
    }

    this.roomStore.removeUserFromRoom(roomCode, userId);
  }

  /**
   * Delete a room
   */
  deleteRoom(roomCode: string): boolean {
    return this.roomStore.deleteRoom(roomCode);
  }

  /**
   * Get all rooms (for testing purposes)
   */
  getRooms(): Map<string, Room> {
    return this.roomStore.getRooms();
  }
}
