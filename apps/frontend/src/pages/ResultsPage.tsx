import { useParams } from "react-router-dom";
import { useSocket } from "../contexts";
import { useEffect } from "react";
import type { GameState } from "../types";

export default function ResultsPage() {
  // State: Room info
  // Event for handling game end state
  const { roomId } = useParams();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on("game:state_updated", (gameState: GameState) => {});
    return () => {
      socket.off("game:state_updated");
    };
  }, [socket]);

  // TODO: conditionally handle rendering of game state here

  return <h1>Results Page — Room ID: {roomId}</h1>;
}
