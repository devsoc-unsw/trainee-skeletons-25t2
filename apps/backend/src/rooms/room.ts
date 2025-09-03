import { Result } from "pg";
import type { User, Restaurant } from "../types";
import { v4 as uuidv4 } from 'uuid';

export class Room {
  id: string;
  owner: User;
  users: Set<User> = new Set();
  code: string;
  endDate: Date; 
  restaurants: Restaurant[];
  gameState: "LOBBY" | "STARTED" | "FINISHED" = "LOBBY"

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
    for (const resto of this.restaurants) {
      if (resto.id === restaurantId) {
        return resto;
      }
    }
    return null;
  }

  voteRestaurant(restaurantId: string, vote: number) {
    for (const resto of this.restaurants)  {
      if (resto.id === restaurantId) {
        resto.votes += vote;
      }
    }
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

    this.gameState = "STARTED";

    // TODO:
    // add timer logic here
  }

  endVoting() {
    this.users.forEach(user => {
      user.userState = "VOTING";
    });

    this.gameState = "FINISHED";
  }

  // sort restaurants in place rather than returning anything 
  // default 5
  prepareResults() {
    this.restaurants.sort((a, b) => {
      if (a.votes < b.votes) {
        return -1
      } 
      if (a.votes > b.votes) {
        return 1
      }

      return 0;
    });

  }
  
  toObject() {
    return {
      id: this.id,
      owner: this.owner,
      users: Array.from(this.users),
      code: this.code,
      endDate: this.endDate,
      restaurants: this.restaurants
    };
  }

}
