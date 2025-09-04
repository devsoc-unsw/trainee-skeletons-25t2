import express from "express";
import cors from "cors";
import { DefaultEventsMap, Server } from "socket.io";
import { createServer } from "node:http";
import {
  createRoomRouter,
  setUpRoomSocketListeners,
  SocketState,
  RoomService,
} from "./rooms";
import { config } from "./config";

const app = express();
const httpServer = createServer(app);
const io = new Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketState
>(httpServer, {
  cors: {
    origin: config.cors.origin,
  },
});

// Create roomService instance and inject it
const roomService = new RoomService();
setUpRoomSocketListeners(io, roomService);

app.use(cors()).use(express.json()).use("", createRoomRouter(roomService));

export { httpServer, io, app };
