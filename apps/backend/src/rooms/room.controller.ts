import type { Request, Response } from "express";
import { v1 } from "@googlemaps/places";
import { Restaurant, CreateRoomRequest, JoinRoomRequest } from "./room.types";
import { v4 as uuidv4 } from "uuid";
import mockRestaurantData from "./restaurants-mock.json";

import "dotenv/config";
import { roomService } from "./room.service";
import { User } from "../types";
import { google } from "@googlemaps/places/build/protos/protos";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const USE_MOCK_RESTAURANTS = process.env.USE_MOCK_RESTAURANTS;

export async function createRoom(
  req: Request<{}, {}, CreateRoomRequest>,
  res: Response,
) {
  try {
    const { ownerName, location, cuisine, priceLevel, minRating } = req.body;
    const newUser: User = {
      userId: uuidv4(),
      name: ownerName,
      userState: "WAITING",
    };

    if (USE_MOCK_RESTAURANTS) {
      const newRoom = roomService.createRoom(
        newUser,
        mockRestaurantData.restaurants,
      );
      return res.status(200).json({
        user: newUser,
        room: newRoom.toRoomResponse(),
      });
    }

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

    const newRoom = roomService.createRoom(newUser, restaurantsWithPhotoUrls);
    return res
      .status(200)
      .json({ user: newUser, room: newRoom.toRoomResponse() });
  } catch (error) {
    console.error("Error creating room:", error);
    return res.status(500).json({ error: "Failed to create room" });
  }
}

export async function joinRoom(
  req: Request<{ roomCode: string }, {}, JoinRoomRequest>,
  res: Response,
) {
  try {
    const { roomCode } = req.params;
    const { userName } = req.body;

    if (!userName) {
      return res.status(400).json({ error: "User name is required" });
    }

    const room = roomService.getRoom(roomCode);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const newUser = {
      userId: uuidv4(),
      name: userName.trim(),
      userState: "WAITING" as const,
    };

    room.addUser(newUser);

    return res.json({
      user: newUser,
      room: room.toRoomResponse(),
    });
  } catch (error) {
    console.error("Error joining room:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
