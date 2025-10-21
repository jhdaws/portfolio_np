"use client";

import Image from "next/image";
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
          <div className={styles.media}>
            <Image
              src={book.image}
              alt={book.title}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 90vw, 420px"
              unoptimized
            />
          </div>
        )}
        <div className={styles.meta}>
          <h3 className={styles.title}>{book.title}</h3>
          <p className={styles.subtitle}>{book.author}</p>
          <p className={styles.description}>{book.description}</p>
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
