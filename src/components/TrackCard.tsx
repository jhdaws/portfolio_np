"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/components/ProjectCard.module.css";
import { isAdmin } from "@/utils/auth";
import type { TrackData } from "@/utils/trackData";

interface Props {
  track: TrackData;
  onDelete?: (slug: string) => void;
}

export default function TrackCard({ track, onDelete }: Props) {
  const admin = isAdmin();

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
          <Image
            src={track.image}
            alt={track.title}
            width={600}
            height={400}
            className={styles.image}
            sizes="(max-width: 600px) 100vw, 600px"
            style={{ width: "100%", height: "200px" }}
            unoptimized
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
          <button onClick={handleDelete}>🗑 Delete</button>
        </div>
      )}
    </div>
  );
}
