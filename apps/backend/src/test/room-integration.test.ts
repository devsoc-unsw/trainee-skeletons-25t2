import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import request from "supertest";
import mockRestaurantData from "../restaurants/restaurants-mock.json";
import { RestaurantService } from "../restaurants";
import {
  createTestServer,
  closeTestServer,
  clearAllRooms,
  disconnectAllSockets,
  waitForSocketEvents,
  createSocket,
  wait,
  TestServer,
} from "./test-utils";

// Mock the RestaurantService
vi.mock("../restaurants/index.js");

const PORT = 4001;

describe("Room Integration Tests (Express + Socket.IO)", () => {
  let testServer: TestServer;

  beforeAll(async () => {
    testServer = await createTestServer(PORT);
  });

  afterAll(async () => {
    await closeTestServer(testServer);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any existing socket connections
    disconnectAllSockets(testServer.io);
    // Clear all rooms from the room service
    clearAllRooms(testServer.roomService);
  });

  afterEach(async () => {
    // Wait a bit between tests to ensure cleanup
    await wait(100);
  });

  it("should join room and establish socket connection", async () => {
    vi.mocked(RestaurantService.prototype.searchRestaurants).mockResolvedValue(
      mockRestaurantData.restaurants,
    );

    // 1. Create a room via API
    const createRes = await request(testServer.baseUrl)
      .post("/room")
      .send({
        ownerName: "Alice",
        location: "Melbourne",
        cuisine: "Chinese",
        priceLevel: "$",
        minRating: 3,
      })
      .expect(200);

    const roomCode = createRes.body.room.code;
    expect(roomCode).toBeDefined();

    // 2. Join room via API
    const joinRes = await request(testServer.baseUrl)
      .post(`/room/${roomCode}`)
      .send({ userName: "Bob" })
      .expect(200);

    expect(joinRes.body.user).toBeDefined();
    expect(joinRes.body.room).toBeDefined();
    expect(joinRes.body.user.name).toBe("Bob");

    // 3. Connect socket using join response details
    const socket = createSocket(
      testServer.baseUrl,
      roomCode,
      joinRes.body.user.userId,
      joinRes.body.user.name,
    );

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

  it("should handle multiple users joining the same room", async () => {
    vi.mocked(RestaurantService.prototype.searchRestaurants).mockResolvedValue(
      mockRestaurantData.restaurants,
    );

    // 1. Create a room
    const createRes = await request(testServer.baseUrl)
      .post("/room")
      .send({
        ownerName: "Host",
        location: "Sydney",
        cuisine: "Italian",
        priceLevel: "$$",
        minRating: 4,
      })
      .expect(200);

    const roomCode = createRes.body.room.code;

    // 2. Join multiple users
    const user1Res = await request(testServer.baseUrl)
      .post(`/room/${roomCode}`)
      .send({ userName: "User1" })
      .expect(200);

    const user2Res = await request(testServer.baseUrl)
      .post(`/room/${roomCode}`)
      .send({ userName: "User2" })
      .expect(200);

    // 3. Connect first socket
    const socket1 = createSocket(
      testServer.baseUrl,
      roomCode,
      user1Res.body.user.userId,
      user1Res.body.user.name,
    );
    await waitForSocketEvents(socket1, ["connect", "user:join"]);
    expect(socket1.connected).toBe(true);

    // 4. Wait a bit before connecting second socket
    await wait(100);

    // 5. Connect second socket
    const socket2 = createSocket(
      testServer.baseUrl,
      roomCode,
      user2Res.body.user.userId,
      user2Res.body.user.name,
    );
    await waitForSocketEvents(socket2, ["connect", "user:join"]);
    expect(socket2.connected).toBe(true);

    socket1.disconnect();
    socket2.disconnect();
  });

  it("should handle voting functionality via socket", async () => {
    vi.mocked(RestaurantService.prototype.searchRestaurants).mockResolvedValue(
      mockRestaurantData.restaurants,
    );

    // 1. Create room and join
    const createRes = await request(testServer.baseUrl)
      .post("/room")
      .send({
        ownerName: "Owner",
        location: "Brisbane",
        cuisine: "Mexican",
        priceLevel: "$$$",
        minRating: 4.5,
      })
      .expect(200);

    const roomCode = createRes.body.room.code;
    const ownerId = createRes.body.user.userId;

    const joinRes = await request(testServer.baseUrl)
      .post(`/room/${roomCode}`)
      .send({ userName: "Voter" })
      .expect(200);

    // 2. Connect socket
    const socket = createSocket(
      testServer.baseUrl,
      roomCode,
      joinRes.body.user.userId,
      joinRes.body.user.name,
    );

    await waitForSocketEvents(socket, ["connect", "user:join"]);

    // 3. Start voting (as owner)
    const ownerSocket = createSocket(
      testServer.baseUrl,
      roomCode,
      ownerId,
      "Owner",
    );

    await waitForSocketEvents(ownerSocket, ["connect", "user:join"]);

    // Start voting
    ownerSocket.emit("room:startVoting");

    // Wait for game state update
    await new Promise<void>((resolve) => {
      ownerSocket.on("game:state_update", (state: string) => {
        expect(state).toBe("STARTED");
        resolve();
      });
    });

    // 4. Vote for a restaurant
    const restaurantId = mockRestaurantData.restaurants[0].id;
    socket.emit("room:voteRestaurant", { restaurantId, vote: 1 });

    // Wait for vote confirmation
    await new Promise<void>((resolve) => {
      socket.on("game:restaurant_voted", (result: any) => {
        expect(result.restaurantId).toBe(restaurantId);
        expect(result.newVoteCount).toBe(1);
        expect(result.gameState).toBe("STARTED");
        resolve();
      });
    });

    ownerSocket.disconnect();
    socket.disconnect();
  });

  it("should handle room state management (start/end voting)", async () => {
    vi.mocked(RestaurantService.prototype.searchRestaurants).mockResolvedValue(
      mockRestaurantData.restaurants,
    );

    // 1. Create room and join
    const createRes = await request(testServer.baseUrl)
      .post("/room")
      .send({
        ownerName: "GameMaster",
        location: "Perth",
        cuisine: "Japanese",
        priceLevel: "$$",
        minRating: 4,
      })
      .expect(200);

    const roomCode = createRes.body.room.code;
    const ownerId = createRes.body.user.userId;

    // 2. Connect owner socket
    const ownerSocket = createSocket(
      testServer.baseUrl,
      roomCode,
      ownerId,
      "GameMaster",
    );

    await waitForSocketEvents(ownerSocket, ["connect", "user:join"]);

    // 3. Start voting
    let stateUpdateCount = 0;
    ownerSocket.emit("room:startVoting");

    await new Promise<void>((resolve) => {
      ownerSocket.on("game:state_update", (state: string) => {
        stateUpdateCount++;
        if (stateUpdateCount === 1) {
          expect(state).toBe("STARTED");
          resolve();
        }
      });
    });

    // 4. End voting
    ownerSocket.emit("room:endVoting");

    await new Promise<void>((resolve) => {
      ownerSocket.on("game:state_update", (state: string) => {
        if (stateUpdateCount === 2) {
          expect(state).toBe("ENDED");
          resolve();
        }
      });
    });

    ownerSocket.disconnect();
  });

  it("should handle user leaving room via socket", async () => {
    vi.mocked(RestaurantService.prototype.searchRestaurants).mockResolvedValue(
      mockRestaurantData.restaurants,
    );

    // 1. Create room and join
    const createRes = await request(testServer.baseUrl)
      .post("/room")
      .send({
        ownerName: "Host",
        location: "Adelaide",
        cuisine: "Indian",
        priceLevel: "$",
        minRating: 3.5,
      })
      .expect(200);

    const roomCode = createRes.body.room.code;

    const joinRes = await request(testServer.baseUrl)
      .post(`/room/${roomCode}`)
      .send({ userName: "Leaver" })
      .expect(200);

    // 2. Connect socket
    const socket = createSocket(
      testServer.baseUrl,
      roomCode,
      joinRes.body.user.userId,
      joinRes.body.user.name,
    );

    await waitForSocketEvents(socket, ["connect", "user:join"]);

    // 3. Leave room - just verify the socket can emit the event without errors
    socket.emit("room:leave", roomCode);

    // Wait a bit for the event to be processed
    await wait(100);

    // Verify the socket is still connected (the leave event should not disconnect it)
    expect(socket.connected).toBe(true);

    socket.disconnect();
  });

  it("should handle invalid room code when joining", async () => {
    // Try to join non-existent room
    const joinRes = await request(testServer.baseUrl)
      .post("/room/INVALID123")
      .send({ userName: "Tester" })
      .expect(404);

    expect(joinRes.body.error).toBe("Room not found");
  });

  it("should handle missing user name when joining", async () => {
    vi.mocked(RestaurantService.prototype.searchRestaurants).mockResolvedValue(
      mockRestaurantData.restaurants,
    );

    // Create a room first
    const createRes = await request(testServer.baseUrl)
      .post("/room")
      .send({
        ownerName: "Host",
        location: "Sydney",
        cuisine: "Italian",
        priceLevel: "$$",
        minRating: 4,
      })
      .expect(200);

    const roomCode = createRes.body.room.code;

    // Try to join without user name
    const joinRes = await request(testServer.baseUrl)
      .post(`/room/${roomCode}`)
      .send({})
      .expect(400);

    expect(joinRes.body.error).toBe("User name is required");
  });

  it("should handle restaurant service errors during room creation", async () => {
    // Mock the restaurant service to throw an error
    vi.mocked(RestaurantService.prototype.searchRestaurants).mockRejectedValue(
      new Error("Google Places API Error"),
    );

    // Attempt to create a room should fail
    const createRes = await request(testServer.baseUrl)
      .post("/room")
      .send({
        ownerName: "TestUser",
        location: "InvalidLocation",
        cuisine: "UnknownCuisine",
        priceLevel: "$$",
        minRating: 4,
      })
      .expect(500);

    expect(createRes.body.error).toBe("Failed to create room");
  });

  it("should handle socket disconnection gracefully", async () => {
    vi.mocked(RestaurantService.prototype.searchRestaurants).mockResolvedValue(
      mockRestaurantData.restaurants,
    );

    // 1. Create room and join
    const createRes = await request(testServer.baseUrl)
      .post("/room")
      .send({
        ownerName: "Host",
        location: "Sydney",
        cuisine: "Italian",
        priceLevel: "$$",
        minRating: 4,
      })
      .expect(200);

    const roomCode = createRes.body.room.code;

    const joinRes = await request(testServer.baseUrl)
      .post(`/room/${roomCode}`)
      .send({ userName: "Disconnector" })
      .expect(200);

    // 2. Connect socket
    const socket = createSocket(
      testServer.baseUrl,
      roomCode,
      joinRes.body.user.userId,
      joinRes.body.user.name,
    );

    await waitForSocketEvents(socket, ["connect", "user:join"]);

    // 3. Disconnect socket
    socket.disconnect();

    // The disconnect handler should be called automatically
    // This test verifies that the socket disconnects without errors
    expect(socket.connected).toBe(false);
  });
});
