"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "@/styles/components/ProjectCard.module.css";
import { isAdmin } from "@/utils/auth";
import type { BookData } from "@/utils/bookData";
import EditBookModal from "@/components/EditBookModal";

interface Props {
  book: BookData;
  onDelete?: (slug: string) => void;
  onUpdate?: () => void;
}

export default function BookCard({ book, onDelete, onUpdate }: Props) {
  const admin = isAdmin();
  const [editing, setEditing] = useState(false);

  const handleDelete = async () => {
    const confirmed = confirm(`Delete book "${book.title}"?`);
    if (!confirmed) return;

    const res = await fetch(`/api/books/${book.slug}`, {
      method: "DELETE",
    });

    if (res.ok) {
      onDelete?.(book.slug);
    } else {
      alert("Failed to delete book");
    }
  };

  return (
    <div className={styles.card}>
      <Link href={`/bookshelf/${book.slug}`} className={styles.link}>
        {book.image && (
          <img src={book.image} alt={book.title} className={styles.image} />
        )}
        <h3>{book.title}</h3>
        <p>
          <em>{book.author}</em>
        </p>
        <p>{book.description}</p>
      </Link>
      {admin && (
        <div className={styles.buttonRow}>
          <button onClick={() => setEditing(true)}>✏️ Edit</button>
          <button onClick={handleDelete}>🗑 Delete</button>
        </div>
      )}
      {editing && (
        <EditBookModal
          book={book}
          onClose={() => setEditing(false)}
          onUpdate={onUpdate ?? (() => {})}
        />
      )}
    </div>
  );
}
