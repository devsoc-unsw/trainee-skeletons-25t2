import { useParams } from "react-router-dom";

export default function HostPage() {
  // IF HOST -> option to share link, play the game, Host control panel where you can see how many people completed + end vote early + timer of when it ends
  // IF ATTENDEE -> play the game.
  // Contained State: Players, Restaurants, Room Details, Votes?
  // Define socket events here for updating room, vote update broadcasts, updating players, updating game state
  const { roomId } = useParams();

  return <h1>Host Page — Room ID: {roomId}</h1>;
}
