import { Room, User } from "./room";

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

  deleteRoom(roomId: string): boolean {
    return this.rooms.delete(roomId);
  }

  // TODO: add more operations here!
}
