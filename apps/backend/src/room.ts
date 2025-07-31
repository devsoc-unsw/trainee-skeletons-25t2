export class Room {
  id: string;
  name: string;
  owner: string;
  users: string[] = [];
  // TODO: need list of restaurants, need to define type (probs look at google api type def)

  constructor(name: string, owner: string, id: string) {
    this.name = name;
    this.id = id;
    this.owner = owner;
  }

  addUser(userId: string) {
    this.users.push(userId);
  }

  removeUser(userId: string) {
    this.users = this.users.filter((id) => id !== userId);
  }
}
