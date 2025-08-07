import axios from "axios";
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Google Places relevatn information
interface PlaceResult {
  name: string;
  rating?: number;
  opening_hours?: { open_now: boolean };
  photos?: any[];
  place_id: string;
  user_ratings_total?: number;
}

// Text search response
interface TextSearchResponse {
  results: PlaceResult[];
  status: string;
}

export async function getUnswRestaurants(): Promise<string> {
  const url = "https://maps.googleapis.com/maps/api/place/textsearch/json";
  const params = {
    key: GOOGLE_PLACES_API_KEY,
    query: "restaurants in University of New South Wales",
  };

  const { data } = await axios.get<TextSearchResponse>(url, { params });

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places error: ${data.status}`);
  }

  const filtered = data.results.map((place) => ({
    name: place.name,
    rating: place.rating,
    is_open: place.opening_hours?.open_now ?? false,
    photos: place.photos,
    place_id: place.place_id,
    user_ratings_total: place.user_ratings_total,
  }));

  return JSON.stringify(filtered);
}

