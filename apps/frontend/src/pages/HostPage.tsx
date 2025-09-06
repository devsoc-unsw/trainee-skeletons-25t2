import { useParams } from "react-router-dom";
import { useSocket } from "../contexts";
import { useEffect, useState } from "react";
import type { GameState, NewVote } from "../types";
import { Copy, Check } from "lucide-react";

export default function HostPage() {
  // IF HOST -> option to share link, play the game, Host control panel where you can see how many people completed + end vote early + timer of when it ends
  // IF ATTENDEE -> play the game.
  // Contained State: Players, Restaurants, Room Details, Votes?
  // Define socket events here for updating room, vote update broadcasts, updating players, updating game state
  const { roomId } = useParams();
  const { socket, connectToRoom } = useSocket();

  const [activeTab, setActiveTab] = useState<
    "players" | "progress" | "controls"
  >("players");
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const roomCode = "1234"; //hard coded ROOM CODE

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

  // TIMER COUNTDOWN
  useEffect(() => {
    const endTime = new Date("2025-09-05T24:00:00"); // hardcoded end time

    const interval = setInterval(() => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("0d 00:00:00");
        clearInterval(interval);
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft(
        `${days}d ${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEndGame = () => {
    alert("Game ended by host!");
  };

  const handleStartGame = () => {
    alert("Game started! Host is also playing.");
  };

  const players = ["Alice", "Bob", "Charlie", "Diana", "Ethan"];

  // if (!socket) {
  //   return <Navigate to="/404" replace />;
  // }

  // TODO: handle redirect for game state change
  return (
    <div className="flex items-center justify-center w-full">
      <div className="bg-white text-black shadow-lg rounded-2xl p-6 w-full max-w-lg space-y-6">
        {/* Room Code - COPY BUTTON */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Room Code: {roomCode}</h2>
          <button
            onClick={handleCopyCode}
            className={`flex items-center gap-1 px-3 py-1 rounded transition ${
              copied ? "bg-gray-500 " : "bg-gray-500  hover:bg-gray-600"
            }`}
          >
            {copied ? (
              <>
                <Check size={16} /> Copied
              </>
            ) : (
              <>
                <Copy size={16} /> Copy
              </>
            )}
          </button>
        </div>
        <hr className="border-t border-gray-300 my-4" />

        {/* Toggle Tabs */}
        <div className="flex">
          <button
            className={`flex-1 py-2 rounded-l-lg ${
              activeTab === "players" ? "bg-gray-500 " : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("players")}
          >
            Players
          </button>
          <button
            className={`flex-1 py-2 ${
              activeTab === "progress" ? "bg-gray-500 " : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("progress")}
          >
            Progress
          </button>
          <button
            className={`flex-1 py-2 rounded-r-lg ${
              activeTab === "controls" ? "bg-gray-500 " : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("controls")}
          >
            Controls
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {/* CURRENT PLAYERS SECTION */}
          {activeTab === "players" && (
            <div className="space-y-2">
              {players.map((player, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 border p-2 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">
                    {player[0]}
                  </div>
                  <span>{player}</span>
                </div>
              ))}
            </div>
          )}

          {/* PROGRESS SECCTION */}
          {activeTab === "progress" && (
            <div className="flex items-center justify-center h-full text-gray-500">
              Progress tracking coming soon...
            </div>
          )}

          {/* CONTROLS SECTION */}
          {activeTab === "controls" && (
            <div className="space-y-4">
              <div className="text-lg font-medium">
                Time Remaining: <span className="text-red-500">{timeLeft}</span>
              </div>
              <button
                onClick={handleEndGame}
                className="w-full bg-red-500  py-2 rounded-lg hover:bg-red-600"
              >
                End Game Now
              </button>
            </div>
          )}
        </div>
        <hr className="border-t border-gray-300 my-4" />

        {/* Start Game FOR HOST Button */}
        <button
          onClick={handleStartGame}
          className="w-full bg-gray-500  py-2 rounded-lg hover:bg-gray-600"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
