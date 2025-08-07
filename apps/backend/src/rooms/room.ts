export type User = {
  userId: string;
  name: string;
};

export class Room {
  id: string;
  owner: User;
  users: Set<User> = new Set();
  // finished_users: Set<User> = new Set();
  // code: string // room.code = the code that a user needs to input to join the room?

  // TODO: need list of restaurants, need to define type (probs look at google api type def)

  constructor(id: string, owner: User) {
    this.id = id;
    this.owner = owner;
    this.addUser(owner);
  }

  addUser(user: User) {
    this.users.add(user);
  }

  removeUser(user: User) {
    this.users.forEach(curr_user => {
      if (curr_user.userId == user.userId && curr_user.name == user.name) {
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
}
