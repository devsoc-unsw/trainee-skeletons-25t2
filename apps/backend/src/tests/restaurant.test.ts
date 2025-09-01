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
      const restaurant1Id ='ChIJ5-TCPV-xEmsRHzlDkmTCdzA';
  const restaurant2Id = 'ChIJ7xThauixEmsRORPQeeiPD_E';
  const restaurant3Id = 'ChIJeRzML4uxEmsRySrUd30ArIo';
  const NO = -1;
  const YES = 1;
  const SUPERYES = 2; 


  const restaurant1 = {
    id: restaurant1Id,
    name: 'Alleyway Kitchen UNSW',
    distance: 500,
    cuisine: "Chinese",
    rating: 4.7,
    votes: 0,
    is_open: false,
    user_ratings_total: 3,
    reviews: ["best value restaurant on campus"]
  };


  const restaurant2 = {
    id: restaurant2Id,
    name: 'Yallah Eat Pita, Kebab & Shawarma Bar',
    distance: 250,
    cuisine: "somewhere in the middle east/mediterranean",
    rating: 4.5,
    is_open: true,
    votes: 0,
    user_ratings_total: 1220,
    reviews: ["yallah eats is certified bussin - timothy hidalgo"]
  };

  const restaurant3 = {
    id: restaurant3Id,
    name: 'Guzman y Gomez - UNSW',
    distance: 300,
    cuisine: "mexican",
    is_open: true,
    votes: 0,
    user_ratings_total: 766,
    reviews: ["OVERRATED ASFFFFFFFF"]
  };

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

    
    // vote for a restaurant w/ -1, 1, 2 (no, yes, superyes)
    // remember clientSocket is the host, clientSocket1 is just another user.
    await new Promise<void>((resolve) => {
      clientSocket.emit("room:voteResturant",  { restuarantId: restaurant1Id, vote: NO} );
      clientSocket1.emit("room:voteResturant",  { restuarantId: restaurant1Id, vote: NO} );

      clientSocket.once("syncState", (room) => {
        expect(room.getRestaurant(restaurant1Id).votes).toStrictEqual(-2);
        resolve();
      })    
      clientSocket1.once("syncState", (room) => {
        expect(room.getRestaurant(restaurant1Id).votes).toStrictEqual(-2);
        resolve();
      })      
    });

    await new Promise<void>((resolve) => {
      clientSocket.emit("room:voteResturant",  { restuarantId: restaurant2Id, vote: YES} );
      clientSocket1.emit("room:voteResturant",  { restuarantId: restaurant2Id, vote: YES} );

      clientSocket.once("syncState", (room) => {
        expect(room.getRestaurant(restaurant1Id).votes).toStrictEqual(2);
        resolve();
      })     

      clientSocket1.once("syncState", (room) => {
        expect(room.getRestaurant(restaurant1Id).votes).toStrictEqual(2);
        resolve();
      })   
    });

    await new Promise<void>((resolve) => {
      clientSocket.emit("room:voteResturant",  { restuarantId: restaurant3Id, vote: SUPERYES} );
      clientSocket1.emit("room:voteResturant",  { restuarantId: restaurant3Id, vote: SUPERYES} );

      clientSocket.once("syncState", (room) => {
        expect(room.getRestaurant(restaurant3Id).votes).toStrictEqual(-2);
        resolve();
      });     

      clientSocket1.once("syncState", (room) => {
        expect(room.getRestaurant(restaurant3Id).votes).toStrictEqual(-2);
        resolve();
      });
    });
    
  });
  
});

