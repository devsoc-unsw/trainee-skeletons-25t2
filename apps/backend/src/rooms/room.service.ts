import { Room } from "./room";
import { User } from "../types";

export class RoomService {
  private rooms: Map<string, Room> = new Map();

  createRoom(roomId: string, owner: User): Room {
    const room = new Room(roomId, owner);
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  // kind of just for testing -> can get rid of later?
  getRooms(): Map<String, Room> {
    return this.rooms;
  }

  deleteRoom(roomId: string): boolean {
    return this.rooms.delete(roomId);
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
