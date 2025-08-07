import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RoomPage from "./pages/RoomPage";
import ResultsPage from "./pages/ResultsPage";
import NotFoundPage from "./pages/NotFoundPage";
import { useSocket } from "./contexts/SocketContext";
import { useEffect } from "react";

// TODO: can remove this component, just testing the socket connection works
function TestSocket() {
  const socket = useSocket();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Clean up listeners on unmount
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  return (
    <div>
      <p>Socket status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}</p>
    </div>
  );
}

function App() {
  return (
    <>
      {/* ROUTING */}
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/results/:roomId" element={<ResultsPage />} />
          <Route path="*" element={<NotFoundPage />} /> {/* 404 page */}
        </Routes>
      </Router>
     
      <TestSocket />
    </>
  );
}

export default App;
