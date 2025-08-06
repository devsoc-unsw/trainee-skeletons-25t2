import { beforeEach, afterEach, afterAll, beforeAll, describe, expect, test } from "vitest";
import { io as ioc, Socket as ClientSocket } from "socket.io-client";
import { httpServer } from "../server";
import { RoomService } from "../rooms/room.service";

describe("Socket Integration Tests", () => {
  const userId = "123";
  const name = "Adrian";
  let clientSocket: ClientSocket;
  const roomService = new RoomService();

  const userId1 = "999"
  const name1 = "Tim";
  let clientSocket1: ClientSocket;
  const roomId = "123456";

  // We need to set up a test client socket and set up the http server to test
  beforeEach(async () => {
    const port = 3001;
    await new Promise<void>((resolve) =>
      httpServer.listen(port, () => {
        clientSocket = ioc(`http://localhost:${port}`, {
          query: { userId, name },
        });

        clientSocket1 = ioc(`http://localhost:${port}`, {
          query: { userId: userId1, name: name1 },
        });
        clientSocket1.on("connect", resolve)
      }),
    );
  });

  // Need to ensure the socket(s) is not left open
  afterEach(async () => {
    httpServer.close();
    clientSocket.disconnect();
    clientSocket1.disconnect();
  });

  test("Test room creation", async () => {
    await new Promise<void>((resolve) => {
      clientSocket.emit("room:create", { roomId });

      clientSocket.on("syncState", (room) => {
        expect(room).toBeDefined();
        expect(room.id).toBe(roomId);
        expect(room.users).toContainEqual({ userId, name });
        resolve();
      });
    });
  });

  test("Test creating, then joining a room", async () => {
    await new Promise<void>((resolve) => {
      clientSocket.emit("room:create", { roomId });
      
      clientSocket.on("syncState", (room) => {
        expect(room).toBeDefined();
        expect(room.id).toBe(roomId);
        expect(room.users).toContainEqual({ userId, name });
        resolve()
      });
    });

    await new Promise<void>((resolve) => {
      clientSocket1.emit("room:join", { user: { userId: userId1, name: name1 }, roomId: roomId})

      clientSocket1.once("syncState", (room) => {
        expect(room.users).toContainEqual({ userId, name });
        expect(room.users).toContainEqual({ userId: userId1, name: name1 });
        expect(room.users.length).toStrictEqual(2);
        resolve();
      })     
    });
  });
  
  test("Test leaving a room", async () => {

    // setup room w 2 users
    await new Promise<void>((resolve) => {
      clientSocket.emit("room:create", { roomId });

      clientSocket.once("syncState", (room) => {
        expect(room).toBeDefined();
        expect(room.id).toBe(roomId);
        console.log(`are there two usres in here already? ${JSON.stringify(room.users)}`)
        expect(room.users).toContainEqual({ userId, name });
        resolve();
      });
    });

    await new Promise<void>((resolve) => {
      clientSocket1.emit("room:join", { user: { userId: userId1, name: name1 }, roomId: roomId})

      clientSocket1.once("syncState", (room) => {
        expect(room.users).toContainEqual({ userId, name });
        expect(room.users).toContainEqual({ userId: userId1, name: name1 });
        resolve();
      })
    });

    await new Promise<void>((resolve) => {
      clientSocket1.emit("room:leave", { user: { userId: userId1, name: name1 }, roomId: roomId})
      
      clientSocket.once("syncState", (room) => {
        expect(room.users.length).toStrictEqual(1);
        expect(room.users).toContainEqual({ userId, name });
        resolve()
      })
    });
  });
});
