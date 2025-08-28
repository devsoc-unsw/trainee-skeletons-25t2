import { useParams } from "react-router-dom";

export default function HostPage() {
  // IF HOST -> option to share link, play the game, Host control panel where you can see how many people completed + end vote early + timer of when it ends
  // IF ATTENDEE -> play the game.
  const { roomId } = useParams();

  return <h1>Host Page — Room ID: {roomId}</h1>;
}
