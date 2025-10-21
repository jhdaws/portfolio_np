"use client";

import { useEffect, useState } from "react";
import BookCard from "@/components/BookCard";
import NewBookModal from "@/components/NewBookModal";
import styles from "@/styles/pages/Projects.module.css";
import { isAdmin } from "@/utils/auth";
import type { BookData } from "@/utils/bookData";

export default function BooksClient() {
  const [books, setBooks] = useState<BookData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const admin = isAdmin();

  const loadBooks = async () => {
    const res = await fetch("/api/books", { cache: "no-store" });
    if (res.ok) {
      setBooks(await res.json());
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleAddBook = () => {
    loadBooks();
  };

  const handleDeleteBook = (slug: string) => {
    setBooks((prev) => prev.filter((b) => b.slug !== slug));
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bookshelf</h1>
      {admin && (
        <>
          <div className={styles.actions}>
            <button
              className={styles.primaryButton}
              onClick={() => setShowModal(true)}
            >
              Add New Book
            </button>
          </div>
          {showModal && (
            <NewBookModal onClose={handleCloseModal} onAdd={handleAddBook} />
          )}
        </>
      )}
      <div className={styles.grid}>
        {books.map((b) => (
          <BookCard
            key={b.slug}
            book={b}
            onDelete={handleDeleteBook}
          />
        ))}
      </div>
    </div>
  );
}
