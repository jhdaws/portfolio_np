"use client";

import { useState } from "react";
import styles from "@/styles/components/NewProjectModal.module.css";
import type { BookData } from "@/utils/bookData";

interface Props {
  book: BookData;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditBookModal({ book, onClose, onUpdate }: Props) {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [description, setDescription] = useState(book.description);
  const [year, setYear] = useState(book.year ? String(book.year) : "");
  const [genre, setGenre] = useState(book.genre || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    await fetch(`/api/books/${book.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        author,
        description,
        year: year ? Number(year) : undefined,
        genre,
      }),
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
        <h2>Edit Book</h2>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input type="text" value={year} onChange={(e) => setYear(e.target.value)} />
        <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} />
        <button onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
