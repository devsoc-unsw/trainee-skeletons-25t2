import { User } from "../types";
import { Restaurant } from "../restaurants";

// TODO: Add timer
export type CreateRoomRequest = {
  ownerName: string;
  location: string;
  cuisine: string;
  priceLevel: "$" | "$$" | "$$$" | "$$$$";
  minRating?: 3.5 | 4 | 4.5;
};

export type RestaurantSearchParams = Omit<CreateRoomRequest, "ownerName">;

export type JoinRoomRequest = {
  userName: string;
};

export type RoomResponse = {
  id: string;
  owner: User;
  users: User[];
  code: string;
  endDate: Date;
  restaurants: Restaurant[];
  restaurantVotes: { [id: string]: number };
  gameState: GameState;
};

export type GameState = "LOBBY" | "STARTED" | "FINISHED";
