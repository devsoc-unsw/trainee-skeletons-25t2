import { User } from "../types";

// TODO: Add timer
export type CreateRoomRequest = {
  ownerName: string;
  location: string;
  cuisine: string;
  priceLevel: "$" | "$$" | "$$$" | "$$$$";
  minRating?: 3.5 | 4 | 4.5;
};

export type JoinRoomRequest = {
  userName: string;
};

// We use strings for monetary values bc 64 bit values are represented as strings in JSON
export type Restaurant = {
  id: string;
  name: string;
  address: string;
  rating: number;
  minPrice: string;
  maxPrice: string;
  mapLink: string | undefined | null;
  openNow: boolean;
  reviews: Review[];
  photos: string[];
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

export type Review = {
  rating: number;
  text: string;
};

export type GameState = "LOBBY" | "STARTED" | "FINISHED";
