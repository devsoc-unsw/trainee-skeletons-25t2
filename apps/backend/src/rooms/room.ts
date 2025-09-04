import type { User } from "../types";
import type { GameState, Restaurant, RoomResponse } from "./room.types";
import { v4 as uuidv4 } from "uuid";

export class Room {
  id: string;
  owner: User;
  users: Map<string, User> = new Map();
  code: string;
  endDate: Date;
  restaurants: Map<string, Restaurant> = new Map();
  restaurantVotes: Map<string, number>;
  gameState: GameState = "LOBBY";

  constructor(owner: User, restaurants?: Restaurant[]) {
    this.id = uuidv4();
    this.owner = owner;
    this.addUser(owner);
    this.code = uuidv4().slice(0, 4); // could (should) add collision checking
    this.restaurants = new Map(restaurants?.map((r) => [r.id, r]));
    this.restaurantVotes = new Map(restaurants?.map((r) => [r.id, 0]));
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    this.endDate = defaultDate;
  }

  addUser(user: User) {
    this.users.set(user.userId, user);
  }

  addRestaurant(restaurant: Restaurant) {
    this.restaurants.set(restaurant.id, restaurant);
  }

  getRestaurant(restaurantId: string) {
    return this.restaurants.get(restaurantId);
  }

  voteRestaurant(restaurantId: string, vote: number) {
    const prev = this.restaurantVotes.get(restaurantId);
    if (!prev) return;
    this.restaurantVotes.set(restaurantId, prev + vote);
  }

  removeUser(userId: string) {
    this.users.delete(userId);
  }

  startVoting() {
    this.users.forEach((user) => {
      user.userState = "VOTING";
    });

    this.gameState = "STARTED";

    // TODO:
    // add timer logic here
  }

  endVoting() {
    this.users.forEach((user) => {
      user.userState = "FINISHED";
    });

    this.gameState = "FINISHED";
  }

  // get the top restaurant result
  prepareResults(): Restaurant | undefined {
    const restaurantsArray = Array.from(this.restaurants.values());
    return restaurantsArray.reduce((top, current) => {
      const currentVotes = this.restaurantVotes.get(current.id) || 0;
      const topVotes = this.restaurantVotes.get(top.id) || 0;
      return currentVotes > topVotes ? current : top;
    }, restaurantsArray[0]);
  }

  toRoomResponse(): RoomResponse {
    return {
      id: this.id,
      owner: this.owner,
      users: Array.from(this.users.values()),
      code: this.code,
      endDate: this.endDate,
      restaurants: Array.from(this.restaurants.values()),
      restaurantVotes: Object.fromEntries(this.restaurantVotes),
      gameState: this.gameState,
    };
  }
}
