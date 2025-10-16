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
          <Image
            src={book.image}
            alt={book.title}
            width={600}
            height={400}
            className={styles.image}
            sizes="(max-width: 600px) 100vw, 600px"
            style={{ width: "100%", height: "200px" }}
            unoptimized
          />
        )}
        <h3>{book.title}</h3>
        <p>
          <em>{book.author}</em>
        </p>
        <p>{book.description}</p>
      </Link>
      {admin && (
        <div className={styles.buttonRow}>
          <button onClick={handleDelete}>🗑 Delete</button>
        </div>
      )}
    </div>
  );
}
