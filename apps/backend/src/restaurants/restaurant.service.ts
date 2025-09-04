import { v1 } from "@googlemaps/places";
import { Restaurant, RestaurantSearchParams } from "./restaurant.types";
import { v4 as uuidv4 } from "uuid";
import mockRestaurantData from "./restaurants-mock.json";
import { google } from "@googlemaps/places/build/protos/protos";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const USE_MOCK_RESTAURANTS = true; // Can be made configurable via env

export class RestaurantService {
  /**
   * Search for restaurants based on the given parameters
   * Returns mock data if USE_MOCK_RESTAURANTS is true, otherwise calls Google Places API
   */
  async searchRestaurants(
    params: RestaurantSearchParams,
  ): Promise<Restaurant[]> {
    if (USE_MOCK_RESTAURANTS) {
      return mockRestaurantData.restaurants;
    }

    return this.searchRestaurantsFromGoogle(params);
  }

  /**
   * Search for restaurants using Google Places API
   */
  private async searchRestaurantsFromGoogle(
    params: RestaurantSearchParams,
  ): Promise<Restaurant[]> {
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error("Google Places API key is not configured");
    }

    const { location, cuisine, priceLevel, minRating } = params;

    // Map price level string to Google Places API enum
    const getGooglePriceLevel = (priceLevel: string) => {
      switch (priceLevel) {
        case "$":
          return google.maps.places.v1.PriceLevel.PRICE_LEVEL_INEXPENSIVE;
        case "$$":
          return google.maps.places.v1.PriceLevel.PRICE_LEVEL_MODERATE;
        case "$$$":
          return google.maps.places.v1.PriceLevel.PRICE_LEVEL_EXPENSIVE;
        case "$$$$":
          return google.maps.places.v1.PriceLevel.PRICE_LEVEL_VERY_EXPENSIVE;
        default:
          return google.maps.places.v1.PriceLevel.PRICE_LEVEL_MODERATE;
      }
    };

    const googlePriceLevel = getGooglePriceLevel(priceLevel);
    const client = new v1.PlacesClient({ apiKey: GOOGLE_PLACES_API_KEY });

    const [searchResponse] = await client.searchText(
      {
        textQuery: `${cuisine} restaurants, ${location}`,
        includedType: "restaurant",
        minRating,
        priceLevels: [googlePriceLevel],
        maxResultCount: 10,
      },
      {
        otherArgs: {
          headers: {
            "X-Goog-FieldMask": "*",
          },
        },
      },
    );

    const restaurants: Restaurant[] = (searchResponse.places ?? []).map(
      (place) => {
        return {
          id: place.id ?? uuidv4(),
          name: place.displayName?.text ?? "Undefined",
          address: place.formattedAddress ?? "Undefined",
          rating: place.rating ?? 0,
          minPrice: place.priceRange?.startPrice?.units as string,
          maxPrice: place.priceRange?.endPrice?.units as string,
          mapLink: place.googleMapsUri,
          openNow: place.currentOpeningHours?.openNow ?? false,
          reviews: (place.reviews ?? []).map((review) => {
            return {
              rating: review.rating ?? 0,
              text: review.text?.text ?? "",
            };
          }),
          // Fine to use != since we want to filter out both null and undefined
          photos: (place.photos ?? [])
            .map((photo) => (photo?.name ? photo.name + "/media" : undefined))
            .filter((photo) => photo != undefined)
            .slice(0, 4),
        };
      },
    );

    // For each restaurant, resolve photo names to direct URLs via getPhotoMedia
    const restaurantsWithPhotoUrls: Restaurant[] = await Promise.all(
      restaurants.map(async (restaurant) => {
        const photoUrls = await Promise.all(
          restaurant.photos.map(async (photoName) => {
            try {
              console.log(photoName);
              const [photoResponse] = await client.getPhotoMedia(
                {
                  name: photoName,
                  maxWidthPx: 800,
                  skipHttpRedirect: true,
                },
                {},
              );
              return photoResponse.photoUri ?? undefined;
            } catch (e) {
              console.log(e);
              return undefined;
            }
          }),
        );

        return {
          ...restaurant,
          photos: photoUrls.filter((u): u is string => u != null),
        };
      }),
    );

    return restaurantsWithPhotoUrls;
  }
}
