"use client";
import { Navigate, useParams } from "react-router-dom";
import { useSocket } from "../contexts";
import { useEffect, useState } from "react";
import type { GameState } from "../types";
import { Star, X, Heart, MapPin } from "lucide-react";

interface Restaurant {
  name: string;
  image: string;
  rating: string;
  price: string;
  location: string;
  cuisine: string;
  googleMapsLink: string;
  openingTime: string;
  topReviews: string[];
}

const restaurants: Restaurant[] = [
  {
    name: "Sushi Place",
    image:
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=400&q=80",
    rating: "4.5",
    price: "$$",
    location: "Sydney",
    cuisine: "Japanese",
    googleMapsLink: "https://goo.gl/maps/example1",
    openingTime: "10:00 AM - 10:00 PM",
    topReviews: [
      "Amazing sushi and fresh fish!",
      "Loved the ambiance.",
      "Great service, will return!",
    ],
  },
  {
    name: "Pizza Corner",
    image:
      "https://images.unsplash.com/photo-1594007653716-1861d1aa2f31?auto=format&fit=crop&w=400&q=80",
    rating: "4.2",
    price: "$",
    location: "Melbourne",
    cuisine: "Italian",
    googleMapsLink: "https://goo.gl/maps/example2",
    openingTime: "11:00 AM - 11:00 PM",
    topReviews: [
      "Best pizza in town!",
      "Crust was perfect.",
      "Affordable and tasty.",
    ],
  },
  {
    name: "Burger Hub",
    image:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80",
    rating: "4.0",
    price: "$",
    location: "Brisbane",
    cuisine: "American",
    googleMapsLink: "https://goo.gl/maps/example3",
    openingTime: "09:00 AM - 09:00 PM",
    topReviews: ["Juicy burgers!", "Friendly staff.", "Loved the fries."],
  },
];

export default function SwipePage() {
  // IF HOST -> option to share link, play the game, Host control panel where you can see how many people completed + end vote early + timer of when it ends
  // IF ATTENDEE -> play the game.
  // State: Restaurants, current restaurant index, current restaurant (derived from restaurant with current index state)
  // Event for handling index change maybe?
  // Event for handling game end state
  const { roomId } = useParams();
  const { socket, connectToRoom } = useSocket();
  const [currentIndex, setCurrentIndex] = useState(0); // tracks current elemnt from restaurants[]
  const [flipped, setFlipped] = useState(false); //flipped or not

  useEffect(() => {
    if (!socket) return;

    // Check if the room actually exists on the backend first and use the room id from whatever is obtained from the backend
    if (roomId) {
      connectToRoom(roomId);
    }
    socket.on("game:state_updated", (_gameState: GameState) => {});
    return () => {
      socket.off("game:state_updated");
    };
  }, [socket, roomId, connectToRoom]);

  const handleAction = (action: string) => {
    setFlipped(false); // reset flip when moving to next card

    if (currentIndex < restaurants.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("You have completed the swipe!");
    }

    console.log(
      `Action "${action}" on restaurant:`,
      restaurants[currentIndex].name,
    );
  };

  const current = restaurants[currentIndex];

  // if (!socket) {
  //   return <Navigate to="/404" replace />;
  // }

  return (
    <div className="flex flex-col items-center justify-center w-full ">
      <div className="bg-white text-black flex flex-col justify-center items-center  rounded-2xl p-6 w-full max-w-lg space-y-6">
        {/* Card COMPONENT */}
        <div
          className="w-100 h-[480px] perspective cursor-pointer mt-5"
          onClick={() => setFlipped(!flipped)}
        >
          <div
            className={`relative w-full h-full duration-500 transform-style ${
              flipped ? "rotate-y-180" : ""
            }`}
          >
            {/* CARD FRONT SIDE */}
            <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
              <img
                src={current.image}
                alt={current.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <h2 className="text-xl font-semibold">{current.name}</h2>
                <div className="flex gap-2 items-center">
                  <span className="px-2 py-1 bg-gray-200 rounded-full text-sm">
                    {current.rating} ⭐
                  </span>
                  <span className="px-2 py-1 bg-gray-200 rounded-full text-sm">
                    {current.price}
                  </span>
                </div>
                <div className="flex gap-2 text-gray-600 text-sm">
                  <span>{current.location}</span>
                  <span>• {current.cuisine}</span>
                </div>
                <a
                  href={current.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-500 hover:underline"
                >
                  Link to Google Maps
                </a>
              </div>
            </div>

            {/* CARD BACK SIDE */}
            <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
              <img
                src={current.image}
                alt={current.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-4 flex flex-col justify-between flex-1">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{current.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <MapPin size={16} /> {current.location}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-semibold">Opening:</span>{" "}
                    {current.openingTime}
                  </div>
                  <div>
                    <span className="font-semibold">Top Reviews:</span>
                    <ul className="list-disc list-inside mt-1 text-gray-700 space-y-1">
                      {current.topReviews.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <a
                  href={current.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-blue-500 hover:underline text-center"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-6 mt-4">
          <button
            onClick={() => handleAction("dislike")}
            className="bg-gray-500  p-4 rounded-full hover:bg-gray-600"
          >
            <X size={24} />
          </button>
          <button
            onClick={() => handleAction("superlike")}
            className="bg-gray-500  p-4 rounded-full hover:bg-gray-600"
          >
            <Star size={24} />
          </button>
          <button
            onClick={() => handleAction("like")}
            className="bg-gray-500  p-4 rounded-full hover:bg-gray-600"
          >
            <Heart size={24} />
          </button>
        </div>

        <div className="text-gray-500">
          {currentIndex + 1}/{restaurants.length} Complete
        </div>
      </div>
    </div>
  );
}
