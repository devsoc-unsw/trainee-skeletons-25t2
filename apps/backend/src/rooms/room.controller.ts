import type { Request, Response } from "express";
import { CreateRoomRequest, JoinRoomRequest } from "./room.types";
import { v4 as uuidv4 } from "uuid";
import { RoomService } from "./room.service";
import { User } from "../types";

export function createRoomController(roomService: RoomService) {
  return async function createRoom(
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

      const searchParams = {
        location,
        cuisine,
        priceLevel,
        minRating,
      };

      const newRoom = await roomService.createRoomWithSearch(
        newUser,
        searchParams,
      );

      return res.status(200).json({
        user: newUser,
        room: newRoom.toRoomResponse(),
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to create room" });
    }
  };
}

export function joinRoomController(roomService: RoomService) {
  return async function joinRoom(
    req: Request<{ roomCode: string }, {}, JoinRoomRequest>,
    res: Response,
  ) {
    try {
      const { roomCode } = req.params;
      const { userName } = req.body;

      if (!userName) {
        return res.status(400).json({ error: "User name is required" });
      }

      const { user, room } = roomService.joinRoom(roomCode, userName);

      return res.json({
        user,
        room: room.toRoomResponse(),
      });
    } catch (error) {
      console.error("Error joining room:", error);
      if (error instanceof Error && error.message === "Room not found") {
        return res.status(404).json({ error: "Room not found" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
