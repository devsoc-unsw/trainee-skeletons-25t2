import type { User, Restaurant } from "../types";

export class Room {
  id: string;
  owner: User;
  users: Set<User> = new Set();
  // finished_users: Set<User> = new Set();
  code: string // room.code = the code that a user needs to input to join the room?
  endDate: Date;
  restaurants: Restaurant[] | null;
  // TODO: need list of restaurants, need to define type (probs look at google api type def)

  constructor(id: string, owner: User) {
    this.id = id;
    this.owner = owner;
    this.addUser(owner);
    this.code = "TODO";
    this.restaurants = null;

    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    this.endDate = defaultDate;
  }

  addUser(user: User) {
    this.users.add(user);
  }

  removeUser(userId: string) {
    this.users.forEach(curr_user => {
      if (curr_user.userId == userId) {
        this.users.delete(curr_user);
      }
    });
  }

  toObject() {
    return {
      id: this.id,
      owner: this.owner,
      users: Array.from(this.users),
    };
  }

  // TODO:
  // Generate a unique 4 digit code for users to join the room with
  generateCode() {
    this.code = "TODO";
  }
}
