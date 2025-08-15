"use client";

import { useState } from "react";
import styles from "@/styles/components/NewProjectModal.module.css";

interface Props {
  onClose: () => void;
  onAdd: () => void;
}

export default function NewTrackModal({ onClose, onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !artist || !description) return;
    setUploading(true);

    let imageUrl = "";
    let imagePath = "";

    if (image) {
      const form = new FormData();
      form.append("file", image);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const blob = await res.json();
      imageUrl = blob.url;
      imagePath = blob.pathname;
    }

    await fetch("/api/tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, artist, description, imageUrl, imagePath }),
    });

    setUploading(false);
    onAdd();
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>
          ×
        </button>
        <h2>Add New Track</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label className={styles.uploadBox}>
          {image ? image.name : "Click to select image"}
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>
        <button onClick={handleSubmit} disabled={uploading}>
          {uploading ? "Adding..." : "Add Track"}
        </button>
      </div>
    </div>
  );
}
