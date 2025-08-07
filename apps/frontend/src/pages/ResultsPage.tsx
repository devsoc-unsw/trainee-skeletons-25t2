import { useParams } from "react-router-dom";

export default function ResultsPage() {
  const { roomId } = useParams();

  return <h1>Results Page — Room ID: {roomId}</h1>;
}
