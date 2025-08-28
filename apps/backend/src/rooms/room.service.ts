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

  // kind of just for testing -> can get rid of later?
  getRooms(): Map<String, Room> {
    return this.rooms;
  }

  deleteRoom(roomId: string): boolean {
    return this.rooms.delete(roomId);
  }

  // go through rooms and kick out a user
  disconnectUser(user: User)  {
    this.rooms.forEach(room => {
      room.removeUser(user)
    })
  }

  // TODO: add more operations here!
}
