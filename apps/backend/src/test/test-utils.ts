// test-utils.ts
import { createServer } from "node:http";
import { Server } from "node:http";
import { io as Client, Socket } from "socket.io-client";
import { Server as SocketIOServer, DefaultEventsMap } from "socket.io";
import express from "express";
import cors from "cors";
import {
  createRoomRouter,
  setUpRoomSocketListeners,
  SocketState,
  RoomService,
  createRoomService,
} from "../rooms";

export type TestServer = {
  server: Server;
  httpServer: Server;
  io: SocketIOServer;
  roomService: RoomService;
  baseUrl: string;
};

/**
 * Creates a test server with Express and Socket.IO
 */
export async function createTestServer(port: number): Promise<TestServer> {
  const app = express();
  const httpServer = createServer(app);

  const io = new SocketIOServer<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    SocketState
  >(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const emitEndVotingForRoom = (roomId: string, gameState: string) => {
    io.in(roomId).emit("game:state_change", gameState);
  };

  const roomService = createRoomService(emitEndVotingForRoom);
  setUpRoomSocketListeners(io, roomService);

  app.use(cors()).use(express.json()).use("", createRoomRouter(roomService));

  const server = httpServer.listen(port);
  // Wait for server to be ready

  return {
    server,
    httpServer,
    io,
    roomService,
    baseUrl: `http://localhost:${port}`,
  };
}

/**
 * Closes a test server
 */
export async function closeTestServer(testServer: TestServer): Promise<void> {
  if (testServer.server && testServer.server.listening) {
    testServer.server.close();
  }
}

/**
 * Clears all rooms from the room service
 */
export function clearAllRooms(roomService: RoomService): void {
  const rooms = roomService.getRooms();
  rooms.forEach((_, id) => {
    roomService.deleteRoom(id);
  });
}

/**
 * Disconnects all socket connections
 */
export function disconnectAllSockets(io: SocketIOServer): void {
  io.disconnectSockets();
}

/**
 * Helper function for socket connection testing
 */
export const waitForSocketEvents = (
  socket: Socket,
  events: string[],
  timeout = 10000,
): Promise<void> => {
  return Promise.race([
    Promise.all(
      events.map(
        (event) => new Promise<void>((resolve) => socket.once(event, resolve)),
      ),
    ).then(() => undefined),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Socket events timeout: ${events.join(", ")}`)),
        timeout,
      ),
    ),
  ]);
};

/**
 * Helper function to create and connect socket
 */
export const createSocket = (
  baseUrl: string,
  roomCode: string,
  userId: string,
  name: string,
): Socket => {
  const socket = Client(baseUrl, {
    query: {
      roomId: roomCode,
      userId: userId,
      name: name,
    },
    timeout: 10000,
    forceNew: true, // Force new connection
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  return socket;
};
