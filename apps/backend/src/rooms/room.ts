export type User = {
  userId: string;
  name: string;
};

export class Room {
  id: string;
  owner: User;
  users: Set<User> = new Set();
<<<<<<< HEAD
  // code: string // room.code = the code that a user needs to input to join the room?

=======
>>>>>>> 77b65391f0056439b1df9c887b6091f16433152b
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
<<<<<<< HEAD
    this.users.forEach(curr_user => {
      if (curr_user.userId == user.userId && curr_user.name == user.name) {
        this.users.delete(curr_user);
      }
    });
=======
    this.users.delete(user);
>>>>>>> 77b65391f0056439b1df9c887b6091f16433152b
  }

  toObject() {
    return {
      id: this.id,
      owner: this.owner,
      users: Array.from(this.users),
    };
  }
}
