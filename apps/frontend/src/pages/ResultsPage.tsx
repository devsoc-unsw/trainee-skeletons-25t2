import { useParams } from "react-router-dom";

export default function ResultsPage() {
  // State: Room info
  // Event for handling game end state
  const { roomId } = useParams();

  return <h1>Results Page — Room ID: {roomId}</h1>;
}
