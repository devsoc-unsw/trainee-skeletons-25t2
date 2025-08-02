import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { io as ioc, Socket as ClientSocket } from "socket.io-client";
import { httpServer } from "../server";

describe("Socket Integration Tests", () => {
  const userId = "123";
  const name = "Adrian";
  let clientSocket: ClientSocket;

  // We need to set up a test client socket and set up the http server to test
  beforeAll(async () => {
    const port = 3001;
    await new Promise<void>((resolve) =>
      httpServer.listen(port, () => {
        clientSocket = ioc(`http://localhost:${port}`, {
          query: { userId, name },
        });
        clientSocket.on("connect", resolve);
      }),
    );
  });

  // Need to ensure the socket is not left open
  afterAll(async () => {
    httpServer.close();
    clientSocket.disconnect();
  });

  test("Test room creation", async () => {
    const roomId = "123456";

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
});
