export type User = {
  userId: string;
  name: string;
};

export class Room {
  id: string;
  owner: User;
  users: Set<User> = new Set();
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
    this.users.delete(user);
  }

  toObject() {
    return {
      id: this.id,
      owner: this.owner,
      users: Array.from(this.users),
    };
  }
}
