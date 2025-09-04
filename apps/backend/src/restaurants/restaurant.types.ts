export type RestaurantSearchParams = {
  location: string;
  cuisine: string;
  priceLevel: "$" | "$$" | "$$$" | "$$$$";
  minRating?: 3.5 | 4 | 4.5;
};

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

export type Review = {
  rating: number;
  text: string;
};
