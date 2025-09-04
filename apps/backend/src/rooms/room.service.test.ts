import { describe, it, expect, beforeEach, vi } from "vitest";
import { RoomService } from "./room.service";
import { RoomStore } from "./room.store";
import { User } from "../types";
import mockRestaurantData from "../restaurants/restaurants-mock.json";
import { RestaurantSearchParams, RestaurantService } from "../restaurants";

// Mock the RestaurantService
vi.mock("../restaurants/restaurant.service");

describe("RoomService", () => {
  let roomService: RoomService;
  let mockRoomStore: RoomStore;
  let mockRestaurantService: RestaurantService;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create mock instances
    mockRoomStore = new RoomStore();
    mockRestaurantService = new RestaurantService();

    // Create RoomService with mocked dependencies
    roomService = new RoomService(mockRoomStore, mockRestaurantService);
  });

  describe("createRoomWithSearch", () => {
    it("should create a room with restaurants from search", async () => {
      // Arrange
      const owner: User = {
        userId: "owner-123",
        name: "John Doe",
        userState: "WAITING",
      };

      const searchParams: RestaurantSearchParams = {
        location: "Sydney",
        cuisine: "Italian",
        priceLevel: "$$",
        minRating: 4.0,
      };

      // Mock the restaurant service to return mock data
      vi.mocked(mockRestaurantService.searchRestaurants).mockResolvedValue(
        mockRestaurantData.restaurants,
      );

      // Act
      const result = await roomService.createRoomWithSearch(
        owner,
        searchParams,
      );

      // Assert
      expect(mockRestaurantService.searchRestaurants).toHaveBeenCalledWith(
        searchParams,
      );
      expect(result).toBeDefined();
      expect(result.owner).toEqual(owner);
      expect(result.restaurants.size).toBe(
        mockRestaurantData.restaurants.length,
      );
      expect(result.code).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it("should handle restaurant service errors", async () => {
      // Arrange
      const owner: User = {
        userId: "owner-123",
        name: "John Doe",
        userState: "WAITING",
      };

      const searchParams: RestaurantSearchParams = {
        location: "Sydney",
        cuisine: "Italian",
        priceLevel: "$$",
        minRating: 4.0,
      };

      const error = new Error("API Error");
      vi.mocked(mockRestaurantService.searchRestaurants).mockRejectedValue(
        error,
      );

      // Act & Assert
      await expect(
        roomService.createRoomWithSearch(owner, searchParams),
      ).rejects.toThrow("API Error");
    });
  });

  describe("createRoom", () => {
    it("should create a room with provided restaurants", () => {
      // Arrange
      const owner: User = {
        userId: "owner-123",
        name: "John Doe",
        userState: "WAITING",
      };

      const restaurants = mockRestaurantData.restaurants.slice(0, 3);

      // Act
      const result = roomService.createRoom(owner, restaurants);

      // Assert
      expect(result).toBeDefined();
      expect(result.owner).toEqual(owner);
      expect(result.restaurants.size).toBe(3);
      expect(result.code).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it("should create a room without restaurants", () => {
      // Arrange
      const owner: User = {
        userId: "owner-123",
        name: "John Doe",
        userState: "WAITING",
      };

      // Act
      const result = roomService.createRoom(owner);

      // Assert
      expect(result).toBeDefined();
      expect(result.owner).toEqual(owner);
      expect(result.restaurants.size).toBe(0);
      expect(result.code).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });

  describe("getRoom", () => {
    it("should return a room if it exists", () => {
      // Arrange
      const owner: User = {
        userId: "owner-123",
        name: "John Doe",
        userState: "WAITING",
      };

      const room = roomService.createRoom(owner);

      // Act
      const result = roomService.getRoom(room.code);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(room);
    });

    it("should return undefined if room does not exist", () => {
      // Act
      const result = roomService.getRoom("non-existent-code");

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("joinRoom", () => {
    it("should successfully join a user to an existing room", () => {
      // Arrange
      const owner: User = {
        userId: "owner-123",
        name: "John Doe",
        userState: "WAITING",
      };

      const room = roomService.createRoom(owner);
      const userName = "Jane Smith";

      // Act
      const result = roomService.joinRoom(room.code, userName);

      // Assert
      expect(result).toBeDefined();
      expect(result.user.name).toBe(userName);
      expect(result.user.userState).toBe("WAITING");
      expect(result.room).toEqual(room);
      expect(room.users.has(result.user.userId)).toBe(true);
    });

    it("should throw error when joining non-existent room", () => {
      // Arrange
      const userName = "Jane Smith";

      // Act & Assert
      expect(() => {
        roomService.joinRoom("non-existent-code", userName);
      }).toThrow("Room not found");
    });

    it("should trim whitespace from user name", () => {
      // Arrange
      const owner: User = {
        userId: "owner-123",
        name: "John Doe",
        userState: "WAITING",
      };

      const room = roomService.createRoom(owner);
      const userName = "  Jane Smith  ";

      // Act
      const result = roomService.joinRoom(room.code, userName);

      // Assert
      expect(result.user.name).toBe("Jane Smith");
    });
  });

  describe("startVoting", () => {
    it("should start voting when called by room owner", () => {
      // Arrange
      const owner: User = {
        userId: "owner-123",
        name: "John Doe",
        userState: "WAITING",
      };

      const room = roomService.createRoom(owner);

      // Act
      roomService.startVoting(room.code, owner.userId);

      // Assert
      expect(room.gameState).toBe("STARTED");
      expect(room.users.get(owner.userId)?.userState).toBe("VOTING");
    });

    it("should throw error when non-owner tries to start voting", () => {
      // Arrange
      const owner: User = {
        userId: "owner-123",
        name: "John Doe",
        userState: "WAITING",
      };

      const room = roomService.createRoom(owner);
      const nonOwnerId = "non-owner-123";

      // Act & Assert
      expect(() => {
        roomService.startVoting(room.code, nonOwnerId);
      }).toThrow("Only the room owner can start voting");
    });

    it("should throw error when room does not exist", () => {
      // Act & Assert
      expect(() => {
        roomService.startVoting("non-existent-code", "owner-123");
      }).toThrow("Room not found");
    });
  });

  describe("endVoting", () => {
    it("should end voting when called by room owner", () => {
      // Arrange
      const owner: User = {
        userId: "owner-123",
        name: "John Doe",
        userState: "WAITING",
      };

      const room = roomService.createRoom(owner);
      roomService.startVoting(room.code, owner.userId);

      // Act
      roomService.endVoting(room.code, owner.userId);

      // Assert
      expect(room.gameState).toBe("FINISHED");
      expect(room.users.get(owner.userId)?.userState).toBe("FINISHED");
    });

    it("should throw error when non-owner tries to end voting", () => {
      // Arrange
      const owner: User = {
        userId: "owner-123",
        name: "John Doe",
        userState: "WAITING",
      };

      const room = roomService.createRoom(owner);
      const nonOwnerId = "non-owner-123";

      // Act & Assert
      expect(() => {
        roomService.endVoting(room.code, nonOwnerId);
      }).toThrow("Only the room owner can end voting");
    });

    it("should throw error when room does not exist", () => {
      // Act & Assert
      expect(() => {
        roomService.endVoting("non-existent-code", "owner-123");
      }).toThrow("Room not found");
    });
  });

  describe("voteRestaurant", () => {
    it("should successfully vote for a restaurant", () => {
      // Arrange
      const owner: User = {
        userId: "owner-123",
        name: "John Doe",
        userState: "WAITING",
      };

      const restaurants = mockRestaurantData.restaurants.slice(0, 2);
      const room = roomService.createRoom(owner, restaurants);
      const restaurantId = restaurants[0].id;
      const vote = 1;

      // Act
      const result = roomService.voteRestaurant(room.code, restaurantId, vote);

      // Assert
      expect(result).toBeDefined();
      expect(result.restaurantId).toBe(restaurantId);
      expect(result.newVoteCount).toBe(1);
      expect(result.gameState).toBe("LOBBY");
    });

    it("should accumulate votes for the same restaurant", () => {
      // Arrange
      const owner: User = {
        userId: "owner-123",
        name: "John Doe",
        userState: "WAITING",
      };

      const restaurants = mockRestaurantData.restaurants.slice(0, 2);
      const room = roomService.createRoom(owner, restaurants);
      const restaurantId = restaurants[0].id;

      // Act
      roomService.voteRestaurant(room.code, restaurantId, 1);
      roomService.voteRestaurant(room.code, restaurantId, 2);
      const result = roomService.voteRestaurant(room.code, restaurantId, -1);

      // Assert
      expect(result.newVoteCount).toBe(2); // 1 + 2 - 1 = 2
    });

    it("should throw error when room does not exist", () => {
      // Act & Assert
      expect(() => {
        roomService.voteRestaurant("non-existent-code", "restaurant-123", 1);
      }).toThrow("Room not found");
    });
  });

  describe("prepareResults", () => {
    it("should prepare results when game is finished", () => {
      // Arrange
      const owner: User = {
        userId: "owner-123",
        name: "John Doe",
        userState: "WAITING",
      };

      const restaurants = mockRestaurantData.restaurants.slice(0, 2);
      const room = roomService.createRoom(owner, restaurants);
      roomService.startVoting(room.code, owner.userId);
      roomService.endVoting(room.code, owner.userId);

      // Act
      const result = roomService.prepareResults(room.code);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(room);
    });

    it("should throw error when game is not finished", () => {
      // Arrange
      const owner: User = {
        userId: "owner-123",
        name: "John Doe",
        userState: "WAITING",
      };

      const room = roomService.createRoom(owner);

      // Act & Assert
      expect(() => {
        roomService.prepareResults(room.code);
      }).toThrow("Cannot prepare results, game is not finished");
    });

    it("should throw error when room does not exist", () => {
      // Act & Assert
      expect(() => {
        roomService.prepareResults("non-existent-code");
      }).toThrow("Room not found");
    });
  });

  describe("removeUserFromRoom", () => {
    it("should successfully remove user from room", () => {
      // Arrange
      const owner: User = {
        userId: "owner-123",
        name: "John Doe",
        userState: "WAITING",
      };

      const room = roomService.createRoom(owner);
      const { user } = roomService.joinRoom(room.code, "Jane Smith");

      // Act
      roomService.removeUserFromRoom(room.code, user.userId);

      // Assert
      expect(room.users.has(user.userId)).toBe(false);
    });

    it("should throw error when room does not exist", () => {
      // Act & Assert
      expect(() => {
        roomService.removeUserFromRoom("non-existent-code", "user-123");
      }).toThrow("Room not found");
    });
  });

  describe("deleteRoom", () => {
    it("should successfully delete a room", () => {
      // Arrange
      const owner: User = {
        userId: "owner-123",
        name: "John Doe",
        userState: "WAITING",
      };

      const room = roomService.createRoom(owner);

      // Act
      const result = roomService.deleteRoom(room.code);

      // Assert
      expect(result).toBe(true);
      expect(roomService.getRoom(room.code)).toBeUndefined();
    });

    it("should return false when deleting non-existent room", () => {
      // Act
      const result = roomService.deleteRoom("non-existent-code");

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("getRooms", () => {
    it("should return all rooms", () => {
      // Arrange
      const owner1: User = {
        userId: "owner-1",
        name: "John Doe",
        userState: "WAITING",
      };

      const owner2: User = {
        userId: "owner-2",
        name: "Jane Smith",
        userState: "WAITING",
      };

      const room1 = roomService.createRoom(owner1);
      const room2 = roomService.createRoom(owner2);

      // Act
      const rooms = roomService.getRooms();

      // Assert
      expect(rooms.size).toBe(2);
      expect(rooms.has(room1.code)).toBe(true);
      expect(rooms.has(room2.code)).toBe(true);
    });
  });
});
