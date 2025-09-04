import express from "express";
import cors from "cors";
import { DefaultEventsMap, Server } from "socket.io";
import { createServer } from "node:http";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
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

// Load Swagger specification
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"));

// Create roomService instance and inject it
const roomService = new RoomService();
setUpRoomSocketListeners(io, roomService);

// Setup Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors()).use(express.json()).use("", createRoomRouter(roomService));

export { httpServer, io, app };
