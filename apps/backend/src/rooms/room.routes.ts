import express from "express";
import { createRoom, joinRoom } from "./room.controller";

export const roomRouter = express
  .Router()
  .post("/room", createRoom)
  .post("/room/:roomId", joinRoom);
