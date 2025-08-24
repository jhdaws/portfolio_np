"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "@/styles/components/ProjectCard.module.css";
import { isAdmin } from "@/utils/auth";
import type { TrackData } from "@/utils/trackData";
import EditTrackModal from "@/components/EditTrackModal";

interface Props {
  track: TrackData;
  onDelete?: (slug: string) => void;
  onUpdate?: () => void;
}

export default function TrackCard({ track, onDelete, onUpdate }: Props) {
  const admin = isAdmin();
  const [editing, setEditing] = useState(false);

  const handleDelete = async () => {
    const confirmed = confirm(`Delete track "${track.title}"?`);
    if (!confirmed) return;

    const res = await fetch(`/api/tracks/${track.slug}`, {
      method: "DELETE",
    });

    if (res.ok) {
      onDelete?.(track.slug);
    } else {
      alert("Failed to delete track");
    }
  };

  return (
    <div className={styles.card}>
      <Link href={`/music/${track.slug}`} className={styles.link}>
        {track.image && (
          <img
            src={track.image}
            alt={track.title}
            className={styles.image}
          />
        )}
        <h3>{track.title}</h3>
        <p>
          <em>{track.artist}</em>
        </p>
        <p>{track.description}</p>
      </Link>
      {admin && (
        <div className={styles.buttonRow}>
          <button onClick={() => setEditing(true)}>✏️ Edit</button>
          <button onClick={handleDelete}>🗑 Delete</button>
        </div>
      )}
      {editing && (
        <EditTrackModal
          track={track}
          onClose={() => setEditing(false)}
          onUpdate={onUpdate ?? (() => {})}
        />
      )}
    </div>
  );
}
