import type { Request, Response } from "express";
import { v1 } from "@googlemaps/places";
import { Restaurant } from "./room.types";
import { google } from "@googlemaps/places/build/protos/protos";
import "dotenv/config";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

function mapRestaurantType(place: google.maps.places.v1.IPlace): Restaurant {
  return {
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
}

export async function createRoom(req: Request, res: Response) {
  const client = new v1.PlacesClient({ apiKey: GOOGLE_PLACES_API_KEY });
  const [searchResponse] = await client.searchText(
    {
      textQuery: "Restaurants, UNSW, Australia",
      includedType: "restaurant",
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
    mapRestaurantType,
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
  res.json({ restaurantsWithPhotoUrls });
}
export async function joinRoom(req: Request, res: Response) {}
