import { Room } from "./room";
import { User } from "../types";
import { Restaurant } from "../restaurants";

export class RoomStore {
  private rooms: Map<string, Room> = new Map();

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
   * Add a user to a room
   */
  addUserToRoom(roomCode: string, user: User): void {
    const room = this.getRoom(roomCode);
    if (room) {
      room.addUser(user);
    }
  }

  /**
   * Remove a user from a room
   */
  removeUserFromRoom(roomCode: string, userId: string): void {
    const room = this.getRoom(roomCode);
    if (room) {
      room.removeUser(userId);
    }
  }

  /**
   * Start voting in a room
   */
  startVotingInRoom(roomCode: string): void {
    const room = this.getRoom(roomCode);
    if (room) {
      room.startVoting();
    }
  }

  /**
   * End voting in a room
   */
  endVotingInRoom(roomCode: string): void {
    const room = this.getRoom(roomCode);
    if (room) {
      room.endVoting();
    }
  }

  /**
   * Vote for a restaurant in a room
   */
  voteRestaurantInRoom(
    roomCode: string,
    restaurantId: string,
    vote: number,
  ): void {
    const room = this.getRoom(roomCode);
    if (room) {
      room.voteRestaurant(restaurantId, vote);
    }
  }

  /**
   * Prepare results for a room
   */
  prepareResultsInRoom(roomCode: string): void {
    const room = this.getRoom(roomCode);
    if (room) {
      room.prepareResults();
    }
  }

  /**
   * Delete a room
   */
  deleteRoom(roomCode: string): boolean {
    return this.rooms.delete(roomCode);
  }

  /**
   * Get all rooms (for testing purposes)
   */
  getRooms(): Map<string, Room> {
    return this.rooms;
  }
}
