// tests/integration/room.test.ts
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import request from "supertest";
import { io as Client, Socket } from "socket.io-client";
import { httpServer } from "../server";
import { Server } from "node:http";
import mockRestaurantData from "../restaurants/restaurants-mock.json";
import { RestaurantService } from "../restaurants";

// Mock the RestaurantService
vi.mock("../restaurants/index.js");

const PORT = 4000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper function for socket connection testing
const waitForSocketEvents = (
  socket: Socket,
  events: string[],
  timeout = 5000,
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

describe("Room integration (Express + Socket.IO)", () => {
  let server: Server;

  beforeAll(async () => {
    server = httpServer.listen(PORT);
  });

  afterAll(async () => {
    server.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a room and connect via socket", async () => {
    vi.mocked(RestaurantService.prototype.searchRestaurants).mockResolvedValue(
      mockRestaurantData.restaurants,
    );

    // 1. Create a room via API
    const createRes = await request(BASE_URL)
      .post("/room")
      .send({
        ownerName: "Adrian",
        location: "Sydney",
        cuisine: "Italian",
        priceLevel: "$$",
        minRating: 4,
      })
      .expect(200);

    const roomCode = createRes.body.room.code;
    expect(roomCode).toBeDefined();
    expect(createRes.body.user).toBeDefined();
    expect(createRes.body.room).toBeDefined();
    expect(createRes.body.room.restaurants).toHaveLength(
      mockRestaurantData.restaurants.length,
    );

    // Verify that the restaurant service was called with correct parameters
    expect(RestaurantService.prototype.searchRestaurants).toHaveBeenCalledWith({
      location: "Sydney",
      cuisine: "Italian",
      priceLevel: "$$",
      minRating: 4,
    });

    // 2. Join room via API
    const joinRes = await request(BASE_URL)
      .post(`/room/${roomCode}`)
      .send({ userName: "Tester" })
      .expect(200);

    expect(joinRes.body.user).toBeDefined();
    expect(joinRes.body.room).toBeDefined();
    expect(joinRes.body.user.name).toBe("Tester");

    // 3. Connect socket
    const socket = Client(BASE_URL, {
      query: {
        roomId: roomCode,
        userId: joinRes.body.user.userId,
        name: joinRes.body.user.name,
      },
    });

    // 4. Wait for socket connection and verify events
    socket.on("connect", () => {
      expect(socket.connected).toBe(true);
    });

    socket.on("user:join", (data: string) => {
      expect(data).toEqual(joinRes.body.user.userId);
    });

    await waitForSocketEvents(socket, ["connect", "user:join"]);

    socket.disconnect();
  });

  it("should handle restaurant service errors gracefully", async () => {
    // Mock the restaurant service to throw an error
    vi.mocked(RestaurantService.prototype.searchRestaurants).mockRejectedValue(
      new Error("API Error"),
    );

    // Attempt to create a room via API should fail
    const createRes = await request(BASE_URL)
      .post("/room")
      .send({
        ownerName: "Adrian",
        location: "Sydney",
        cuisine: "Italian",
        priceLevel: "$$",
        minRating: 4,
      })
      .expect(500);

    expect(createRes.body.error).toBe("Failed to create room");
  });
});
