import express from "express";
import { createRoomController, joinRoomController } from "./room.controller";
import { RoomService } from "./room.service";

export function createRoomRouter(roomService: RoomService) {
  return express
    .Router()
    .post("/room", createRoomController(roomService))
    .post("/room/:roomCode", joinRoomController(roomService));
}
