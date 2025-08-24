"use client";

import { useState } from "react";
import styles from "@/styles/components/NewProjectModal.module.css";
import type { TrackData } from "@/utils/trackData";

interface Props {
  track: TrackData;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditTrackModal({ track, onClose, onUpdate }: Props) {
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [description, setDescription] = useState(track.description);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    await fetch(`/api/tracks/${track.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, artist, description }),
    });
    setSaving(false);
    onUpdate();
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>
          ×
        </button>
        <h2>Edit Track</h2>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
