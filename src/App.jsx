import { useState, useEffect } from "react";
import React from "react";
import "./App.css";

const CLIENT_ID = "bf9f2ee78f9d4a609652190784ad67cd";
const REDIRECT_URI = "http://localhost:5173/callback";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES =
  "user-top-read streaming user-read-playback-state user-modify-playback-state playlist-modify-public playlist-modify-private";

export default function SpotifyTop() {
  const [token, setToken] = useState("");
  const [topArtists, setTopArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    let tokenFromUrl = new URLSearchParams(hash.replace("#", "?")).get(
      "access_token"
    );

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      window.localStorage.setItem("spotify_token", tokenFromUrl);
      window.location.hash = "";
    }
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Karlol Music",
        getOAuthToken: (cb) => cb(token),
        volume: 0.5,
      });

      player.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
      });

      player.connect();
    };
  }, [token]);

  const getTopTracks = async () => {
    if (!token) return;

    try {
      const res = await fetch(
        "https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setTopTracks(data.items || []);
      setActiveTab("tracks");
    } catch (error) {
      console.error(error);
    }
  };

  const getTopArtists = async () => {
    if (!token) return;
    const res = await fetch(
      "https://api.spotify.com/v1/me/top/artists?limit=10&time_range=short_term",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    setTopArtists(data.items);
    setActiveTab("artists");
  };

  const playSpotifyTrack = async (trackUri) => {
    if (!deviceId) return;
    await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [trackUri] }),
      }
    );
  };

  const stopSpotifyTrack = async () => {
    if (!deviceId) return;
    await fetch("https://api.spotify.com/v1/me/player/pause", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const generatePlaylist = async () => {
    if (!token || topTracks.length === 0) return;

    try {
      const userRes = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      const userId = userData.id;

      const playlistRes = await fetch(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Top 10 Karlol Music",
            description: "Karlol music is the best.",
            public: false,
          }),
        }
      );

      const playlistData = await playlistRes.json();
      const playlistId = playlistData.id;

      await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: topTracks.map((track) => track.uri),
        }),
      });

      alert("Playlist créée avec succès dans ton compte Spotify !");
    } catch (error) {
      console.error("Erreur lors de la création de la playlist :", error);
      alert("Erreur lors de la création de la playlist.");
    }
  };

  return (
    <div className="container">
      {!token ? (
        <>
          <h1 className="app-title">Karlol Music</h1>
          <p className="app-subtitle">
            Découvre tes artistes et chansons préférés avec Spotify.
          </p>
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}&response_type=${RESPONSE_TYPE}`}
          >
            <button className="spotify-btn">Se connecter avec Spotify</button>
          </a>
        </>
      ) : (
        <>
          <h1 className="app-title">Ton Top Spotify</h1>

          <div className="flex flex-row justify-center gap-4 mb-4">
            <button onClick={getTopArtists} className="spotify-btn">
              Voir mon Top Artistes
            </button>
            <button onClick={getTopTracks} className="spotify-btn">
              Voir mon Top Musiques
            </button>
            {activeTab === "tracks" && (
              <button
                onClick={generatePlaylist}
                className="spotify-btn bg-purple-500"
              >
                🎧 Générer Playlist
              </button>
            )}
            <button
              onClick={stopSpotifyTrack}
              className="spotify-btn bg-red-500"
            >
              🛑 Stop
            </button>
          </div>

          {activeTab && (
            <div className="results-container flex flex-col items-center">
              {activeTab === "artists" && (
                <div className="bg-gray-900 p-6 rounded-xl w-96 max-h-[1000px] overflow-y-auto">
                  <h2 className="text-white text-center text-xl mb-4">
                    Top Artistes
                  </h2>
                  {topArtists.map((artist, index) => (
                    <div
                      key={artist.id}
                      className="p-4 bg-gray-800 rounded-xl mb-3"
                    >
                      <p className="text-lg font-bold text-green-400">
                        #{index + 1}
                      </p>
                      <img
                        src={artist.images[0]?.url}
                        alt={artist.name}
                        className="rounded-full w-24 h-24 mx-auto"
                      />
                      <p className="text-white text-center mt-2">
                        {artist.name}
                      </p>
                      <p className="text-gray-400 text-center">
                        {artist.genres.slice(0, 2).join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "tracks" && (
                <div className="bg-gray-900 p-6 rounded-xl w-96 max-h-[1000px] overflow-y-auto">
                  <h2 className="text-white text-center text-xl mb-4">
                    Top Musiques
                  </h2>
                  {topTracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="p-4 bg-gray-800 rounded-xl mb-3"
                    >
                      <p className="text-lg font-bold text-green-400">
                        #{index + 1}
                      </p>
                      <div
                        className="relative group cursor-pointer"
                        onClick={() => playSpotifyTrack(track.uri)}
                      >
                        <img
                          src={track.album.images[0]?.url}
                          alt={track.name}
                          className="w-24 h-24 mx-auto rounded-lg transition-opacity duration-300 group-hover:opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-white bg-black bg-opacity-50 rounded-full p-2"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-white text-center mt-2">
                        {track.name}
                      </p>
                      <p className="text-gray-400 text-center">
                        {track.artists.map((a) => a.name).join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
