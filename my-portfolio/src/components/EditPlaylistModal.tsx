"use client";

import { useState } from "react";
import styles from "@/styles/components/NewProjectModal.module.css";
import type { PlaylistData } from "@/utils/playlistData";

interface Props {
  playlist: PlaylistData;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditPlaylistModal({ playlist, onClose, onUpdate }: Props) {
  const [title, setTitle] = useState(playlist.title);
  const [description, setDescription] = useState(playlist.description);
  const [url, setUrl] = useState(playlist.url);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    await fetch(`/api/playlists/${playlist.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, url }),
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
        <h2>Edit Playlist</h2>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
