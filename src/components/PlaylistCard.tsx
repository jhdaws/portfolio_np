"use client";

import Image from "next/image";
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
          <Image
            src={playlist.image}
            alt={playlist.title}
            width={600}
            height={400}
            className={styles.image}
            sizes="(max-width: 600px) 100vw, 600px"
            style={{ width: "100%", height: "200px" }}
            unoptimized
          />
        )}
        <h3>{playlist.title}</h3>
        <p>{playlist.description}</p>
      </a>
      {admin && (
        <div className={styles.buttonRow}>
          <button onClick={handleDelete}>🗑 Delete</button>
        </div>
      )}
    </div>
  );
}
