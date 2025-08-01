import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { io as Client, Socket } from "socket.io-client";
import { httpServer } from "../server";



describe("Socket Tests", () => {
  const userId = "123";
  const name = "Adrian";
  let socket: Socket;

  beforeAll(async () => {
    const port = 3001;
    await new Promise<void>((resolve) => httpServer.listen(port, resolve));
    socket = Client(`http://localhost:${port}`, {
      query: { userId, name },
    });
  });

  afterAll(async () => {
    socket.close();
    await new Promise<void>((resolve, reject) =>
      httpServer.close((err) => (err ? reject(err) : resolve())),
    );
  });

  test("Test room creation", async () => {
    const roomId = "123456";

    await new Promise<void>((resolve) => {
      socket.emit("room:create", { roomId });

      socket.on("syncState", (room) => {
        expect(room).toBeDefined();
        expect(room.id).toBe(roomId);
        expect(room.users).toContainEqual({ userId, name });
        resolve();
      });
    });
  })

})
