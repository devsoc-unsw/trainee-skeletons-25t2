export type CreateRoomRequest = {
  ownerId: string;
  location: string;
  cuisine: string;
  priceLevel: "$" | "$$" | "$$$" | "$$$$";
  minRating?: 3.5 | 4 | 4.5;
};

// We use strings for monetary values bc 64 bit values are represented as strings in JSON
export type Restaurant = {
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

export type Review = {
  rating: number;
  text: string;
};
