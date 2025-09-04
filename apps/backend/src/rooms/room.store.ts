import { Room } from "./room";
import { User } from "../types";
import {
  Restaurant,
  CreateRoomRequest,
  JoinRoomRequest,
  RestaurantSearchParams,
} from "./room.types";
import { RestaurantService } from "./restaurant.service";
import { v4 as uuidv4 } from "uuid";

export class RoomStore {
  private rooms: Map<string, Room> = new Map();
  private restaurantService: RestaurantService;

  constructor(restaurantService?: RestaurantService) {
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
    return this.createRoom(owner, restaurants);
  }

  /**
   * Create a new room with the given owner and restaurants
   */
  createRoom(owner: User, restaurants?: Restaurant[]): Room {
    const room = new Room(owner, restaurants);
    this.rooms.set(room.code, room);
    return room;
  }

  /**
   * Get a room by its code
   */
  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode);
  }

  /**
   * Join a user to an existing room
   */
  joinRoom(roomCode: string, userName: string): { user: User; room: Room } {
    const room = this.getRoom(roomCode);
    if (!room) {
      throw new Error("Room not found");
    }

    const newUser: User = {
      userId: uuidv4(),
      name: userName.trim(),
      userState: "WAITING",
    };

    room.addUser(newUser);
    return { user: newUser, room };
  }

  /**
   * Start voting in a room (only owner can do this)
   */
  startVoting(roomCode: string, userId: string): void {
    const room = this.getRoom(roomCode);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.owner.userId !== userId) {
      throw new Error("Only the room owner can start voting");
    }

    room.startVoting();
  }

  /**
   * End voting in a room (only owner can do this)
   */
  endVoting(roomCode: string, userId: string): void {
    const room = this.getRoom(roomCode);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.owner.userId !== userId) {
      throw new Error("Only the room owner can end voting");
    }

    room.endVoting();
  }

  /**
   * Vote for a restaurant in a room
   */
  voteRestaurant(
    roomCode: string,
    restaurantId: string,
    vote: number,
  ): { restaurantId: string; newVoteCount: number; gameState: string } {
    const room = this.getRoom(roomCode);
    if (!room) {
      throw new Error("Room not found");
    }

    room.voteRestaurant(restaurantId, vote);
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
    const room = this.getRoom(roomCode);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.gameState !== "FINISHED") {
      throw new Error("Cannot prepare results, game is not finished");
    }

    room.prepareResults();
    return room;
  }

  /**
   * Remove a user from a room
   */
  removeUserFromRoom(roomCode: string, userId: string): void {
    const room = this.getRoom(roomCode);
    if (!room) {
      throw new Error("Room not found");
    }

    room.removeUser(userId);
  }

  // kind of just for testing -> can get rid of later?
  getRooms(): Map<String, Room> {
    return this.rooms;
  }

  deleteRoom(roomCode: string): boolean {
    return this.rooms.delete(roomCode);
  }

  // go through rooms and kick out a user
  // just assume that a User can only be in 1 room at a time so
  // dont need this rn
  // disconnectUser(user: User)  {
  //   this.rooms.forEach(room => {
  //     room.removeUser(user)
  //   })
  // }

  // TODO: add more operations here!
}
