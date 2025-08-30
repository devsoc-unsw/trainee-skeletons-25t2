export type User = {
  userId: string;
  name: string;
  userState: UserState;
};

export type Restaurant = {
  id: number,
  name: string,
  distance: number,
  cuisine: string,
  rating: number,
  is_open: boolean,
  votes: number, // the total number of votes for a restaurant
  user_ratings_total: number
  reviews: string[]
}

export type UserState = "WAITING" | "VOTING" | "FINISHED";