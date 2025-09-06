"use client";
import { useParams } from "react-router-dom";
import { useSocket } from "../contexts";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { GameState } from "../types";

interface ResultPageProps {
  mode: "waiting" | "result";
}

export default function ResultPage({ mode }: ResultPageProps) {
  // State: Room info
  // Event for handling game end state
  const { socket, connectToRoom } = useSocket();
  const [timeLeft, setTimeLeft] = useState("");
  const { roomId } = useParams();

  const navigate = useNavigate();

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

  // HARDCODED end time
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const endTime = new Date("2025-09-07T22:00:00");

  // Countdown
  useEffect(() => {
    if (mode !== "waiting") return;

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
  }, [mode, endTime]);

  // HARDCODED restaurant result
  const restaurant = {
    title: "Sushi Place",
    image:
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=400&q=80",
    cuisine: "Japanese",
    price: "$$",
    rating: "4.5",
    votesYes: 12,
    votesNo: 3,
  };

  // Example stats
  const stats = [
    { label: "Total Votes", result: "15" },
    { label: "Top Cuisine", result: "Japanese" },
    { label: "Highest Rated", result: "4.5" },
    { label: "Most Popular Price", result: "$$" },
    { label: "Total Attendees", result: "5" },
  ];

  return (
    <div className="flex flex-col items-center justify-start  w-full">
      <div className="bg-white text-black shadow-lg rounded-2xl p-6 w-full max-w-lg space-y-6">
        {/* WAITING VERSION FOR GUESTS */}
        {mode === "waiting" ? (
          <div className="text-center space-y-4">
            <p className="text-[30px] font-semibold text-center">
              You have completed the swipe!
            </p>

            <p>
              The results will show when the timer expires or the game ends.
              Bookmark this link and come back later!
            </p>
            <hr className="border-t border-gray-300 my-4" />

            <div className="text-red-500 font-bold text-xl">{timeLeft}</div>
          </div>
        ) : (
          <>
            {/* Restaurant Card */}
            <p className="text-[30px] font-semibold text-center">Results</p>
            <hr className="border-t border-gray-300 my-4" />

            <div className="bg-white p-6 rounded-2xl shadow-md max-w-lg w-full flex gap-4">
              <img
                src={restaurant.image}
                alt={restaurant.title}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1 flex flex-col justify-between">
                <h3 className="text-lg font-semibold">{restaurant.title}</h3>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-gray-200 rounded-full text-sm">
                    {restaurant.cuisine}
                  </span>
                  <span className="px-2 py-1 bg-gray-200 rounded-full text-sm">
                    {restaurant.price}
                  </span>
                  <span className="px-2 py-1 bg-gray-200 rounded-full text-sm">
                    {restaurant.rating}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Yes ({restaurant.votesYes})</span>
                    <span>No ({restaurant.votesNo})</span>
                  </div>
                  <div className="w-full h-4 bg-red-200 rounded-full relative">
                    <div
                      className="h-4 bg-green-500 rounded-l-full absolute left-0 top-0"
                      style={{
                        width: `${
                          (restaurant.votesYes /
                            (restaurant.votesYes + restaurant.votesNo)) *
                          100
                        }%`,
                      }}
                    />
                    <div
                      className="h-4 bg-red-500 rounded-r-full absolute right-0 top-0"
                      style={{
                        width: `${
                          (restaurant.votesNo /
                            (restaurant.votesYes + restaurant.votesNo)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RESULTS PAGE FOR END GAME */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
              {stats.slice(0, 3).map((s, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl shadow-md text-center"
                >
                  <div className="text-xl font-bold">{s.result}</div>
                  <div className="text-sm text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
              {stats.slice(3).map((s, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl shadow-md text-center"
                >
                  <div className="text-xl font-bold">{s.result}</div>
                  <div className="text-sm text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <hr className="border-t border-gray-300 my-4" />

            <div className="flex gap-4 w-full max-w-lg">
              <button
                onClick={() => navigate("/")}
                className="flex-1 bg-blue-500  py-2 rounded-lg hover:bg-blue-600"
              >
                Create New Game
              </button>
              <button className="flex-1 bg-green-500  py-2 rounded-lg hover:bg-green-600">
                Share Result
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
