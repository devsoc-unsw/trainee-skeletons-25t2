import { useParams } from "react-router-dom";

export default function SwipePage() {
  // IF HOST -> option to share link, play the game, Host control panel where you can see how many people completed + end vote early + timer of when it ends
  // IF ATTENDEE -> play the game.
  // State: Restaurants, current restaurant index, current restaurant (derived from restaurant with current index state)
  // Event for handling index change maybe?
  // Event for handling game end state
  const { roomId } = useParams();

  return <h1>Swipe Page — Room ID: {roomId}</h1>;
}
