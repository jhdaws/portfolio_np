"use client";

import styles from "@/styles/components/ProjectCard.module.css";
import { isAdmin } from "@/utils/auth";
import type { PlaylistData } from "@/utils/playlistData";

interface Props {
  playlist: PlaylistData;
  onDelete?: (slug: string) => void;
}

export default function PlaylistCard({ playlist, onDelete }: Props) {
  const admin = isAdmin();

  const handleDelete = async () => {
    const confirmed = confirm(`Delete playlist "${playlist.title}"?`);
    if (!confirmed) return;
    const res = await fetch(`/api/playlists/${playlist.slug}`, {
      method: "DELETE",
    });
    if (res.ok) {
      onDelete?.(playlist.slug);
    } else {
      alert("Failed to delete playlist");
    }
  };

  return (
    <div className={styles.card}>
      <a href={playlist.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
        {playlist.image && (
          <img
            src={playlist.image}
            alt={playlist.title}
            className={styles.image}
          />
        )}
        <h3>{playlist.title}</h3>
        <p>{playlist.description}</p>
      </a>
      {admin && (
        <button onClick={handleDelete} className={styles.deleteButton}>
          🗑 Delete
        </button>
      )}
    </div>
  );
}
