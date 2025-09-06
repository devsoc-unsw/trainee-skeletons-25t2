import { useParams } from "react-router-dom";
import { useSocket } from "../contexts";
import { useEffect } from "react";
import type { GameState } from "../types";

export default function ResultsPage() {
  // State: Room info
  // Event for handling game end state
  const { roomId } = useParams();
  const { socket, connectToRoom } = useSocket();

  // Check if the room actually exists on the backend first and use the room id from whatever is obtained from the backend
  useEffect(() => {
    if (!socket) return;
    if (roomId) {
      connectToRoom(roomId);
    }
    socket.on("game:state_updated", (_gameState: GameState) => {});
    return () => {
      socket.off("game:state_updated");
    };
  }, [socket, roomId, connectToRoom]);

  // TODO: conditionally handle rendering of game state here

  return <h1>Results Page — Room ID: {roomId}</h1>;
}
