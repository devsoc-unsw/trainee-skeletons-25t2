import { Navigate, useParams } from "react-router-dom";
import { useSocket } from "../contexts";
import { useEffect } from "react";
import type { GameState, NewVote } from "../types";

export default function HostPage() {
  // IF HOST -> option to share link, play the game, Host control panel where you can see how many people completed + end vote early + timer of when it ends
  // IF ATTENDEE -> play the game.
  // Contained State: Players, Restaurants, Room Details, Votes?
  // Define socket events here for updating room, vote update broadcasts, updating players, updating game state
  const { roomId } = useParams();
  const { socket, connectToRoom } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Check if the room actually exists on the backend first and use the room id from whatever is obtained from the backend
    if (roomId) {
      connectToRoom(roomId);
    }

    socket.on("user:join", (_userId: string) => {});
    socket.on("user:leave", (_userId: string) => {});
    socket.on("game:state_updated", (_gameState: GameState) => {});
    socket.on("game:restaurant_voted", (_newVote: NewVote) => {});

    return () => {
      socket.off("user:join");
      socket.off("user:leave");
      socket.off("user:state_updated");
      socket.off("game:restaurant_voted");
    };
  }, [socket, roomId, connectToRoom]);

  if (!socket) {
    return <Navigate to="/404" replace />;
  }

  // TODO: handle redirect for game state change
  return <h1>Host Page — Room ID: {roomId}</h1>;
}
