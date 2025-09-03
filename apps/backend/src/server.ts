import express from "express";
import cors from "cors";
import "dotenv/config";
import { DefaultEventsMap, Server } from "socket.io";
import { createServer } from "node:http";
import setUpSocketListeners, { SocketState } from "./sockets";
import { roomRouter } from "./rooms";

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

setUpSocketListeners(io);

app.use(cors()).use(express.json()).use("", roomRouter);

export { httpServer, io, app };
