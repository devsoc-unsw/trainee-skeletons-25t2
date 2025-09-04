import express from "express";
import cors from "cors";
import "dotenv/config";
import { DefaultEventsMap, Server } from "socket.io";
import { createServer } from "node:http";
import {
  createRoomRouter,
  setUpRoomSocketListeners,
  SocketState,
  RoomService,
} from "./rooms";

const app = express();
const httpServer = createServer(app);
const io = new Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketState
>(httpServer, {
  // TODO: put this in env variable
  cors: {
    origin: "http://localhost:5173",
  },
});

// Create roomService instance and inject it
const roomService = new RoomService();
setUpRoomSocketListeners(io, roomService);

app.use(cors()).use(express.json()).use("", createRoomRouter(roomService));

export { httpServer, io, app };
