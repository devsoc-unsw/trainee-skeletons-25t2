import { Room } from "./room";
import { User } from "../types";
import { Restaurant } from "./room.types";

export class RoomService {
  private rooms: Map<string, Room> = new Map();

  createRoom(owner: User, restaurants?: Restaurant[]): Room {
    const room = new Room(owner, restaurants);
    this.rooms.set(room.code, room);
    return room;
  }

  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode);
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

export const roomService = new RoomService();
