export class Room {
  id: string;
  owner: string;
  users: string[] = [];
  // TODO: need list of restaurants, need to define type (probs look at google api type def)

  constructor(id: string, owner: string) {
    this.id = id;
    this.owner = owner;
    this.addUser(owner);
  }

  addUser(userId: string) {
    this.users.push(userId);
  }

  removeUser(userId: string) {
    this.users = this.users.filter((id) => id !== userId);
  }
}
