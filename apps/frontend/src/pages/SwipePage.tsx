import { Navigate, useParams } from "react-router-dom";
import { useSocket } from "../contexts";
import { useEffect } from "react";
import type { GameState } from "../types";

export default function SwipePage() {
  // IF HOST -> option to share link, play the game, Host control panel where you can see how many people completed + end vote early + timer of when it ends
  // IF ATTENDEE -> play the game.
  // State: Restaurants, current restaurant index, current restaurant (derived from restaurant with current index state)
  // Event for handling index change maybe?
  // Event for handling game end state
  const { roomId } = useParams();
  const { socket, connectToRoom } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Check if the room actually exists on the backend first and use the room id from whatever is obtained from the backend
    if (roomId) {
      connectToRoom(roomId);
    }
    socket.on("game:state_updated", (_gameState: GameState) => {});
    return () => {
      socket.off("game:state_updated");
    };
  }, [socket, roomId, connectToRoom]);

  if (!socket) {
    return <Navigate to="/404" replace />;
  }
  // TODO: Logic for handling if game is not in voting state

  return <h1>Swipe Page — Room ID: {roomId}</h1>;
}
