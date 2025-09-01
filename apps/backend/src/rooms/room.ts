import { Result } from "pg";
import type { User, Restaurant } from "../types";
import { v4 as uuidv4 } from 'uuid';

export class Room {
  id: string;
  owner: User;
  users: Set<User> = new Set();
  // finished_users: Set<User> = new Set();
  code: string // room.code = the code that a user needs to input to join the room?
  endDate: Date; 
  restaurants: Restaurant[];
  // TODO: need list of restaurants, need to define type (probs look at google api type def)

  constructor(id: string, owner: User) {
    this.id = id;
    this.owner = owner;
    this.addUser(owner);
    this.code = uuidv4().slice(0,4); // could (should) add collision checking 
    this.restaurants = [];

    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    this.endDate = defaultDate;
  }

  addUser(user: User) {
    this.users.add(user);
  }

  addRestaurant(restaurant: Restaurant) {
    this.restaurants.push(restaurant);
  }

  getRestaurant(restaurantId: string) {
    this.restaurants.forEach(resto => {
      if (resto.id === restaurantId) {
        return resto;
      }
    })
  }

  removeUser(userId: string) {
    this.users.forEach(curr_user => {
      if (curr_user.userId == userId) {
        this.users.delete(curr_user);
      }
    });
  }

  startVoting() {
    this.users.forEach(user => {
      user.userState = "VOTING";
    });

    // TODO:
    // add timer logic here
  }
  
  toObject() {
    return {
      id: this.id,
      owner: this.owner,
      users: Array.from(this.users),
    };
  }

}
