"use client";

import { useState } from "react";

export default function HomePage() {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [hostName, setHostName] = useState("");
  const [endTime, setEndTime] = useState("");
  const [attendeeName, setAttendeeName] = useState("");
  const [gameCode, setGameCode] = useState("");

  const handleCreateGame = () => {
    alert(`Game created by: ${hostName}\nEnd Time: ${endTime}`);
  };

  const handleJoinGame = () => {
    alert(`Attendee: ${attendeeName}\nJoining Game Code: ${gameCode}`);
  };

  return (
    <div className="flex items-center justify-center w-full ">
      <div className="bg-white text-black shadow-lg rounded-2xl p-6 w-full max-w-lg space-y-6">
        <p className="text-[30px] font-semibold text-center">Get Started</p>
        <hr className="border-t border-gray-300 my-4" />

        {/* Toggle Buttons */}
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 rounded-l-lg ${
              mode === "create" ? "bg-blue-500" : "bg-blue-200"
            }`}
            onClick={() => setMode("create")}
          >
            Create Game
          </button>
          <button
            className={`flex-1 py-2 rounded-r-lg ${
              mode === "join" ? "bg-blue-500" : "bg-gray-200"
            }`}
            onClick={() => setMode("join")}
          >
            Join Game
          </button>
        </div>

        {/* CREATE GAME FORM CONTENT */}
        {mode === "create" ? (
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Host Name</label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">End Game Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <hr className="border-t border-gray-300 my-4" />

            <button
              onClick={handleCreateGame}
              className="w-full bg-blue-500  py-2 rounded-lg hover:bg-blue-600"
            >
              Create Game
            </button>
          </div>
        ) : (
          // JOIN GAME FORM CONTENT
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Attendee Name</label>
              <input
                type="text"
                value={attendeeName}
                onChange={(e) => setAttendeeName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Game Code</label>
              <input
                type="text"
                value={gameCode}
                maxLength={4}
                onChange={(e) =>
                  setGameCode(e.target.value.replace(/[^0-9]/g, ""))
                }
                className="w-full border rounded-lg px-3 py-2 tracking-widest text-center text-lg"
                placeholder="1234"
              />
            </div>
            <hr className="border-t border-gray-300 my-4" />

            <button
              onClick={handleJoinGame}
              className="w-full bg-green-500  py-2 rounded-lg hover:bg-green-600"
            >
              Join Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
