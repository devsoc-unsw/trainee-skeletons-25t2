"use client";

import { useState } from "react";
import { useParams } from "react-router-dom";

export default function PreferencePage() {
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState<"$" | "$$" | "$$$">("$");
  const [cuisine, setCuisine] = useState("");
  const [rating, setRating] = useState<"Any" | "3.5+" | "4" | "4.5+">("Any");

  const handleSubmit = () => {
    alert(
      `Preferences:\nLocation: ${location}\nPrice: ${price}\nCuisine: ${cuisine}\nRating: ${rating}`,
    );
  };

  // const { roomId } = useParams();
  // return <h1>Preference Page — Room ID: {roomId}</h1>;

  return (
    <div className="flex items-center justify-center w-full">
      <div className="bg-white text-black shadow-lg rounded-2xl p-6 w-full max-w-lg space-y-6">
        <p className="text-[30px] font-semibold text-center">Preferences</p>
        <hr className="border-t border-gray-300 my-4" />

        {/* Location - input box */}
        <div>
          <label className="block mb-1 font-medium">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Enter location"
          />
        </div>

        {/* Price - (4 options) */}
        <div>
          <label className="block mb-1 font-medium">Price</label>
          <div className="flex gap-2">
            {["$", "$$", "$$$"].map((p) => (
              <button
                key={p}
                className={`flex-1 py-2 rounded-lg border ${
                  price === p ? "bg-blue-500 " : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => setPrice(p as "$" | "$$" | "$$$")}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Cuisine (input) */}
        <div>
          <label className="block mb-1 font-medium">Cuisine</label>
          <input
            type="text"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g., Italian, Japanese"
          />
        </div>

        {/* Rating (4 options) */}
        <div>
          <label className="block mb-1 font-medium">Rating</label>
          <div className="grid grid-cols-4 gap-2">
            {["Any", "3.5+", "4", "4.5+"].map((r) => (
              <button
                key={r}
                className={`py-2 rounded-lg border ${
                  rating === r
                    ? "bg-green-500 "
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => setRating(r as "Any" | "3.5+" | "4" | "4.5+")}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Submit BUTTON */}
        <hr className="border-t border-gray-300 my-4" />
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 py-2 rounded-lg hover:bg-blue-600"
        >
          Confirm Preferences
        </button>
      </div>
    </div>
  );
}
