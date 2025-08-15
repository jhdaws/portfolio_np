"use client";

import Link from "next/link";
import styles from "@/styles/components/ProjectCard.module.css";
import { isAdmin } from "@/utils/auth";
import type { BookData } from "@/utils/bookData";

interface Props {
  book: BookData;
  onDelete?: (slug: string) => void;
}

export default function BookCard({ book, onDelete }: Props) {
  const admin = isAdmin();

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
        <button onClick={handleDelete} className={styles.deleteButton}>
          🗑 Delete
        </button>
      )}
    </div>
  );
}
