import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Recommandations() {
  const token = localStorage.getItem("spotify_token");
  const [numTracks, setNumTracks] = useState(10);
  const [trackLimit, setTrackLimit] = useState(10);
  const [seedTracks, setSeedTracks] = useState([]);

  const navigate = useNavigate();

  const getSeedTracks = async () => {
    const res = await fetch(
      "https://api.spotify.com/v1/me/top/tracks?limit=5",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    setSeedTracks(data.items.map((item) => item.id));
    console.log(
      "SeedTracks:",
      data.items.map((item) => item.id)
    );
  };

  // Appelle ceci dans un useEffect après avoir le token
  useEffect(() => {
    if (token) getSeedTracks();
  }, [token]);

  const generateRecommendations = async () => {
    if (!token || seedTracks.length === 0) {
      console.error("Aucun seedTrack défini !");
      return;
    }
  
    // 🚩 Enlève encodeURIComponent ici !
    const seeds = seedTracks.slice(0, 5).join(",");
    console.log("Seeds utilisées (corrigées) :", seeds);
  
    try {
      const recommendationsRes = await fetch(
        `https://api.spotify.com/v1/recommendations?limit=${numTracks}&seed_tracks=${seeds}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!recommendationsRes.ok) {
        const errorDetails = await recommendationsRes.json();
        console.error("Erreur détaillée de Spotify API:", errorDetails);
        throw new Error("Réponse non valide de l'API Spotify");
      }
  
      const recommendationsData = await recommendationsRes.json();
      console.log("Tracks recommandés :", recommendationsData.tracks);
    } catch (error) {
      console.error("Erreur lors de la création des recommandations :", error.message);
    }
  };
  
  
  return (
    <div className="container">
      <h1 className="app-title">Générateur de playlist</h1>
      <h2 className="text-white text-2xl font-bold">
        Selon vos recommandations
      </h2>
      <p className="app-subtitle">
        Choisis le nombre de musiques que tu veux :
      </p>

      <select
        value={numTracks}
        onChange={(e) => setNumTracks(Number(e.target.value))}
        className="spotify-btn my-4"
      >
        {[5, 10, 15, 20, 25, 30, 50].map((num) => (
          <option key={num} value={num}>
            {num} musiques
          </option>
        ))}
      </select>

      <button
        onClick={generateRecommendations}
        className="spotify-btn bg-purple-500"
      >
        Générer ma playlist !
      </button>
    </div>
  );
}
