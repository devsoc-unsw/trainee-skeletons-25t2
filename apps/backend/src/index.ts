import express from "express";
import cors from "cors";
import someRoutes from "./routes/some.route";
import "dotenv/config";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { setUpSocketListeners } from "./socket";

const port = process.env.PORT || "3000";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  // TODO: put this in env variable
  cors: {
    origin: "http://localhost:5173",
  },
});

app.use(cors()).use(express.json()).use("", someRoutes);

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

setUpSocketListeners(io);

process.on("SIGINT", async () => {
  console.log("Shutting down server.");
  process.exit();
});
