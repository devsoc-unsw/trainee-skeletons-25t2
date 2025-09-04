import express from "express";
import cors from "cors";
import "dotenv/config";
import { DefaultEventsMap, Server } from "socket.io";
import { createServer } from "node:http";
import {
  createRoomRouter,
  setUpRoomSocketListeners,
  SocketState,
  RoomStore,
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

// Create roomStore instance and inject it
const roomStore = new RoomStore();
setUpRoomSocketListeners(io, roomStore);

app.use(cors()).use(express.json()).use("", createRoomRouter(roomStore));

export { httpServer, io, app };
