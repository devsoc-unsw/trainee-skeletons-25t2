import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SwipePage from "./pages/SwipePage";
import ResultsPage from "./pages/ResultsPage";
import PreferencePage from "./pages/PreferencesPage";
import HostPage from "./pages/HostPage";
import NavigationBar from "./components/NavigationBar";

import NotFoundPage from "./pages/NotFoundPage";
import { useState } from "react";
import type { User } from "./types";
import { SocketProvider } from "./contexts";

function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <SocketProvider user={user}>
      <div className="flex flex-col min-h-screen">
        <Router>
          {/* Navbar */}
          <header className="sticky top-0 z-20">
            <NavigationBar />
          </header>

          {/* Main content */}
          <main className="flex-1 flex flex-col justify-center items-center">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/room/:roomId/preferences"
                element={<PreferencePage />}
              />
              <Route path="/room/:roomId/host" element={<HostPage />} />
              <Route path="/room/:roomId/swipe" element={<SwipePage />} />
              <Route path="/room/:roomId/results" element={<ResultsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className=" p-4 text-center mt-5 text-white">
            {/* <Footer /> */}
          </footer>
        </Router>
      </div>
    </SocketProvider>
  );
}

export default App;
