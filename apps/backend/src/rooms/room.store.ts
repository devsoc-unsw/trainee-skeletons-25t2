import { Room } from "./room";
import { User } from "../types";
import { Restaurant } from "../restaurants";

export class RoomStore {
  private rooms: Map<string, Room> = new Map();
  private roomCodeToId: Map<string, string> = new Map();

  /**
   * Create a new room with the given owner and restaurants
   */
  createRoom(owner: User, restaurants?: Restaurant[]): Room {
    const room = new Room(owner, restaurants);
    this.rooms.set(room.id, room);
    this.roomCodeToId.set(room.code, room.id);
    return room;
  }

  /**
   * Get a room by its id
   */
  getRoomById(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Get a room by its code
   */
  getRoomByCode(roomCode: string): Room | undefined {
    return this.rooms.get(this.roomCodeToId.get(roomCode) ?? "");
  }

  /**
   * Add a user to a room
   */
  addUserToRoom(roomId: string, user: User): void {
    const room = this.getRoomById(roomId);
    room?.addUser(user);
  }

  /**
   * Remove a user from a room
   */
  removeUserFromRoom(roomId: string, userId: string): void {
    const room = this.getRoomById(roomId);
    room?.removeUser(userId);
  }

  /**
   * Start voting in a room
   */
  startVotingInRoom(roomId: string): void {
    const room = this.getRoomById(roomId);
    room?.startVoting();
  }

  /**
   * End voting in a room
   */
  endVotingInRoom(roomId: string): void {
    const room = this.getRoomById(roomId);
    room?.endVoting();
  }

  /**
   * Vote for a restaurant in a room
   */
  voteRestaurantInRoom(
    roomId: string,
    restaurantId: string,
    vote: number,
  ): void {
    const room = this.getRoomById(roomId);
    room?.voteRestaurant(restaurantId, vote);
  }

  /**
   * Prepare results for a room
   */
  prepareResultsInRoom(roomId: string): void {
    const room = this.getRoomById(roomId);
    room?.prepareResults();
  }

  /**
   * Delete a room
   */
  deleteRoom(roomId: string): boolean {
    return this.rooms.delete(roomId);
  }

  /**
   * Get all rooms (for testing purposes)
   */
  getRooms(): Map<string, Room> {
    return this.rooms;
  }
}
