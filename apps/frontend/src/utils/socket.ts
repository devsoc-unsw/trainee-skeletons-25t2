import { io } from "socket.io-client";
import { Room } from "../../../backend/src/rooms/room";

const URL = "http://localhost:3000";

export const socket = io(URL, {
  autoConnect: false,
});

// TODO:
// syncs the current state of the room emitted from 
// the backend to the frontend (here!)
socket.on("syncState", (room: Room) => {
  console.log(room.id);
});

// TODO:
// advance to the next restaurant for the user
// if there are no more resturants maybe emit some kind of voteFinish event
// to tell the backend that the user is done voting
socket.on("room:nextRestaurant", (payload: {userId: string}) => {
  console.log(payload);
}); 

