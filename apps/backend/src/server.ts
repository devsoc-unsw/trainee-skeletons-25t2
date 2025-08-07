import express from "express";
import cors from "cors";
import someRoutes from "./routes/some.route";
import "dotenv/config";
import { DefaultEventsMap, Server } from "socket.io";
import { createServer } from "node:http";
import setUpSocketListeners from "./sockets";
import { User } from "./rooms/room";

const app = express();
const httpServer = createServer(app);
const io = new Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  User
>(httpServer, {
  // TODO: put this in env variable
  cors: {
    origin: "http://localhost:5173",
  },
});

setUpSocketListeners(io);

app.use(cors()).use(express.json()).use("", someRoutes);

export { httpServer, io, app };
