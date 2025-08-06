import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RoomPage from "./pages/RoomPage";
import ResultsPage from "./pages/ResultsPage";
import NotFoundPage from "./pages/NotFoundPage";

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
    </>
  );
}

export default App;
