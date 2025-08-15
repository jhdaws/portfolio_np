"use client";

import { useEffect, useState } from "react";
import PlaylistCard from "@/components/PlaylistCard";
import TrackCard from "@/components/TrackCard";
import NewPlaylistModal from "@/components/NewPlaylistModal";
import NewTrackModal from "@/components/NewTrackModal";
import styles from "@/styles/pages/Projects.module.css";
import { isAdmin } from "@/utils/auth";
import type { PlaylistData } from "@/utils/playlistData";
import type { TrackData } from "@/utils/trackData";

export default function MusicClient() {
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [tracks, setTracks] = useState<TrackData[]>([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const admin = isAdmin();

  const loadData = async () => {
    const [plRes, trRes] = await Promise.all([
      fetch("/api/playlists"),
      fetch("/api/tracks"),
    ]);
    if (plRes.ok) setPlaylists(await plRes.json());
    if (trRes.ok) setTracks(await trRes.json());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePlaylistAdded = () => loadData();
  const handleTrackAdded = () => loadData();

  const handleDeletePlaylist = (slug: string) => {
    setPlaylists((prev) => prev.filter((p) => p.slug !== slug));
  };

  const handleDeleteTrack = (slug: string) => {
    setTracks((prev) => prev.filter((p) => p.slug !== slug));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Music</h1>

      <section style={{ width: "100%" }}>
        <h2>Playlists</h2>
        {admin && (
          <>
            <button onClick={() => setShowPlaylistModal(true)}>
              Add Playlist
            </button>
            {showPlaylistModal && (
              <NewPlaylistModal
                onClose={() => setShowPlaylistModal(false)}
                onAdd={handlePlaylistAdded}
              />
            )}
          </>
        )}
        <div className={styles.grid}>
          {playlists.map((p) => (
            <PlaylistCard
              key={p.slug}
              playlist={p}
              onDelete={handleDeletePlaylist}
            />
          ))}
        </div>
      </section>

      <section style={{ width: "100%", marginTop: "2rem" }}>
        <h2>Albums & Songs</h2>
        {admin && (
          <>
            <button onClick={() => setShowTrackModal(true)}>Add Track</button>
            {showTrackModal && (
              <NewTrackModal
                onClose={() => setShowTrackModal(false)}
                onAdd={handleTrackAdded}
              />
            )}
          </>
        )}
        <div className={styles.grid}>
          {tracks.map((t) => (
            <TrackCard key={t.slug} track={t} onDelete={handleDeleteTrack} />
          ))}
        </div>
      </section>
    </div>
  );
}
