"use client";

import { useState, useRef } from "react";
import styles from "@/styles/components/ProjectForm.module.css";

type Project = {
  title: string;
  description: string;
  image?: string;
};

type Props = {
  onSubmit: (project: Project) => void;
  onCancel: () => void;
};

export default function ProjectForm({ onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageFileRef = useRef<File | null>(null);

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      imageFileRef.current = file;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = title.toLowerCase().replace(/\s+/g, "-");

    onSubmit({
      title,
      description,
      image: imagePreview ?? undefined,
    });

    setTitle("");
    setDescription("");
    setImagePreview(null);
    imageFileRef.current = null;
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
      <div>
        <label>Title:</label>
        <br />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Description:</label>
        <br />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div
        onDrop={handleImageDrop}
        onDragOver={handleDragOver}
        className={styles.dropZone}
      >
        {imagePreview ? (
          <img src={imagePreview} alt="Preview" className={styles.preview} />
        ) : (
          <p>Drag & drop an image here (optional)</p>
        )}
      </div>

      <div className={styles.actions}>
        <button type="submit">Save Project</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: "1rem" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
