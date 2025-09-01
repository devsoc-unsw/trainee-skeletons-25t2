import { beforeEach, afterEach, afterAll, beforeAll, describe, expect, test } from "vitest";
import { io as ioc, Socket as ClientSocket } from "socket.io-client";
import { httpServer } from "../server";
import { RoomService } from "../rooms/room.service";

// tests:
// room:startVoting


describe("test room:startVoting", () => {
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


  test("1. create a room, join two users and start voting", async () => {
    await new Promise<void>((resolve) => {
      clientSocket.emit("room:create", { roomId });

      clientSocket.once("syncState", (room) => {
        console.log(room.id, room.owner, room.users)

        expect(room).toBeDefined();
        expect(room.id).toBe(roomId);
        expect(room.users).toContainEqual({ userId, name, userState: "WAITING" });
        resolve();
      });
    });

    await new Promise<void>((resolve) => {
      clientSocket1.emit("room:join", { roomId: roomId})

      clientSocket1.once("syncState", (room) => {
        expect(room.users).toContainEqual({ userId, name, userState: "WAITING" });
        expect(room.users).toContainEqual({ userId: userId1, name: name1, userState: "WAITING" });
        expect(room.users.length).toStrictEqual(2);
        resolve();
      })     
    });

    // check that they are both in the VOTING state
    await new Promise<void>((resolve) => {
      clientSocket.emit("room:startVoting");

      clientSocket.once("syncState", (room) => {
        expect(room.users).toContainEqual({ userId, name, userState: "VOTING" });
        expect(room.users).toContainEqual({ userId: userId1, name: name1, userState: "VOTING" });
        expect(room.users.length).toStrictEqual(2);
        resolve();
      })     
    });
  });
  
});

