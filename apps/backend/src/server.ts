import express from "express";
import cors from "cors";
import morgan from "morgan";
import { DefaultEventsMap, Server } from "socket.io";
import { createServer } from "node:http";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import {
  createRoomRouter,
  setUpRoomSocketListeners,
  SocketState,
  createRoomService,
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

const swaggerDocument = YAML.load(path.join(__dirname, "../api-schema.yaml"));

const roomService = createRoomService(io);
setUpRoomSocketListeners(io, roomService);

if (config.nodeEnv !== "test") {
  app.use(morgan("combined"));
}
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors()).use(express.json()).use("", createRoomRouter(roomService));

export { httpServer, io, app };
