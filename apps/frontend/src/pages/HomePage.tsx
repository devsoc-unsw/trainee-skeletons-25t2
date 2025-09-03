import { useState } from 'react';
import "./Pages.css";

type Mode = "host" | "join";

export default function HomePage() {
  // Page state
  const [mode, setMode] = useState<Mode>("host");

  // User input
  const [name, setName] = useState("");
  const [endTime, setTime] = useState("");
  const [code, setCode] = useState("");

  // Placeholder for submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "host") {
      console.log("Hosting game:", { name, endTime });
    } else {
      console.log("Joining game:", { name, code });
    }
  };

  // Returns page info
  return (
    <div className="flex-cc">
      <div className="w-[520px] h-[560px] panel-back">
        <div className="w-[456px] h-[440px] panel-main">
          <img
            src='nomnomvotes_logo.png'
            alt='cookie'
            className="w-40 h-40 object-contain"
          />

          <div className="w-[400px] h-[32px] flex-cc px-2 gap-8">
            <button
              type="button"
              onClick={() => setMode("host")}
              className="w-[180px] h-[32px] button-grey">Host Game
            </button>
            <button
              type="button"
              onClick={() => setMode("join")}
              className="w-[180px] h-[32px] button-grey">Join Game
            </button>
          </div>

          <div className="w-[400px] flex flex-col gap-1">
            <i className="text-gray-900 text-left">Your name</i>
            <input
              type="text"
              placeholder="Enter name"
              className="h-[32px] input-box"
              value={name}
              onChange={(e) => setName(e.target.value)}>
            </input>

            <i className="text-gray-900 text-left">{mode === "host" ? "End time" : "Room code"}</i>
            {mode === "host" && (
              <input
                type="datetime-local"
                placeholder="Voting end time"
                className="h-[32px] input-box"
                value={endTime}
                onChange={(e) => setTime(e.target.value)}>
              </input>
            )}

            {mode === "join" && (
              <input
                type="text"
                placeholder="Room code"
                className="h-[32px] input-box"
                value={code}
                onChange={(e) => setCode(e.target.value)}>
              </input>
            )}

          </div>

          <button
            type='button'
            onClick={handleSubmit}
            className="w-[400px] h-[40px] button-blue text-center flex-cc"
          >
            {mode === "host" ? "Create Game" : "Join Game"}
          </button>
        </div>
      </div>
    </div>
  );
}
