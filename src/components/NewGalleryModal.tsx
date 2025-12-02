"use client";

import { useState } from "react";
import styles from "@/styles/components/NewProjectModal.module.css";

interface Props {
  onClose: () => void;
  onAdd: () => void;
}

export default function NewGalleryModal({ onClose, onAdd }: Props) {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  };

  const handleSubmit = async () => {
    if (!location || !date || !description || !image) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", image);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploaded = await uploadRes.json();

      await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          date,
          description,
          imageUrl: uploaded.url,
          imagePath: uploaded.pathname,
        }),
      });

      onAdd();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add image");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>
          ×
        </button>
        <h2>Add Gallery Image</h2>
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="text"
          placeholder="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
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
            accept="image/*"
            onChange={handleFileChange}
            className={styles.fileInput}
          />
        </label>
        <button onClick={handleSubmit} disabled={busy}>
          {busy ? "Saving..." : "Add Image"}
        </button>
      </div>
    </div>
  );
}
