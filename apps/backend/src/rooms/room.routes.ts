import express from "express";
import { createRoomController, joinRoomController } from "./room.controller";
import { RoomStore } from "./room.store";

export function createRoomRouter(roomStore: RoomStore) {
  return express
    .Router()
    .post("/room", createRoomController(roomStore))
    .post("/room/:roomCode", joinRoomController(roomStore));
}
