import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SpotifyTop from "./SpotifyTop";
import Recommandations from "./Recommandations";

export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Router>
      <nav className="bg-gray-900 py-4 px-6 fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold">Karlol Music</h1>
          <button
            className="text-black text-2xl focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "X" : "Menu"}
          </button>
        </div>

        {isOpen && (
          <div className="flex flex-col gap-2 mt-4">
            <Link
              to="/"
              className="spotify-btn w-full"
              onClick={() => setIsOpen(false)}
            >
              Mes Tops
            </Link>
            <Link
              to="/recommandations"
              className="spotify-btn bg-purple-500 w-full"
              onClick={() => setIsOpen(false)}
            >
              Générateur de playlist
            </Link>
          </div>
        )}
      </nav>

      <div className="pt-32">
        <Routes>
          <Route path="/" element={<SpotifyTop />} />
          <Route path="/recommandations" element={<Recommandations />} />
        </Routes>
      </div>
    </Router>
  );
}
