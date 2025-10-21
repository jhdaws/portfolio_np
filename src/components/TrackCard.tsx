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
          <div className={styles.media}>
            <Image
              src={track.image}
              alt={track.title}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 90vw, 420px"
              unoptimized
            />
          </div>
        )}
        <div className={styles.meta}>
          <h3 className={styles.title}>{track.title}</h3>
          <p className={styles.subtitle}>{track.artist}</p>
          <p className={styles.description}>{track.description}</p>
        </div>
      </Link>
      {admin && (
        <div className={styles.buttonRow}>
          <button onClick={handleDelete}>🗑 Delete</button>
        </div>
      )}
    </div>
  );
}
