"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { isAdmin } from "@/utils/auth";
import FileUploader from "@/components/FileUploader";
import TextAttachmentForm from "@/components/TextAttachmentForm";
import AttachmentRenderer from "@/components/AttachmentRenderer";
import type { BookData } from "@/utils/bookData";
import styles from "@/styles/pages/DetailPage.module.css";
import EditableText from "@/components/EditableText";

export default function BookDetailPage() {
  const params = useParams();
  const slug =
    typeof params.slug === "string"
      ? params.slug
      : (params.slug as string[])[0];

  const [book, setBook] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgBusy, setImgBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const admin = isAdmin();

  const saveTitle = async (newTitle: string) => {
    if (!book) return;
    const prev = book;
    setBook({ ...book, title: newTitle });
    const res = await fetch(`/api/books/${book.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (!res.ok) setBook(prev);
  };

  const saveAuthor = async (newAuthor: string) => {
    if (!book) return;
    const prev = book;
    setBook({ ...book, author: newAuthor });
    const res = await fetch(`/api/books/${book.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: newAuthor }),
    });
    if (!res.ok) setBook(prev);
  };

  const saveYear = async (newYear: string) => {
    if (!book) return;
    const prev = book;
    const year = parseInt(newYear, 10) || undefined;
    setBook({ ...book, year });
    const res = await fetch(`/api/books/${book.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year }),
    });
    if (!res.ok) setBook(prev);
  };

  const saveGenre = async (newGenre: string) => {
    if (!book) return;
    const prev = book;
    setBook({ ...book, genre: newGenre });
    const res = await fetch(`/api/books/${book.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ genre: newGenre }),
    });
    if (!res.ok) setBook(prev);
  };

  const saveDescription = async (newDesc: string) => {
    if (!book) return;
    const prev = book;
    setBook({ ...book, description: newDesc });
    const res = await fetch(`/api/books/${book.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: newDesc }),
    });
    if (!res.ok) setBook(prev);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/books", { cache: "no-store" });
    if (res.ok) {
      const books: BookData[] = await res.json();
      setBook(books.find((b) => b.slug === slug) || null);
    } else {
      setBook(null);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleClickChangeImage = () => fileInputRef.current?.click();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !book) return;

    try {
      setImgBusy(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("filename", file.name);
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!upRes.ok) {
        const err = await upRes.json().catch(() => ({}));
        throw new Error(err?.error || "Upload failed");
      }
      const uploaded = await upRes.json();

      const patchRes = await fetch(`/api/books/${book.slug}/image`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploaded.url,
          imagePathname: uploaded.pathname,
        }),
      });
      if (!patchRes.ok) {
        const err = await patchRes.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to update book image");
      }

      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg || "Failed to change image");
    } finally {
      setImgBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async () => {
    if (!book) return;
    const confirmed = confirm("Remove the book image?");
    if (!confirmed) return;

    try {
      setImgBusy(true);
      const delRes = await fetch(`/api/books/${book.slug}/image`, {
        method: "DELETE",
      });
      if (!delRes.ok) {
        const err = await delRes.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to remove image");
      }
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg || "Failed to remove image");
    } finally {
      setImgBusy(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!book) return <p>Book not found.</p>;

  const hasAttachments = (book.attachments?.length ?? 0) > 0;

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <EditableText
          text={book.title}
          onSave={saveTitle}
          isAdmin={admin}
          tag="h1"
        />
        <div className={styles.meta}>
          <span>
            <EditableText
              text={book.author}
              onSave={saveAuthor}
              isAdmin={admin}
              tag="span"
            />
          </span>
          {book.year !== undefined && (
            <span>
              <EditableText
                text={book.year.toString()}
                onSave={saveYear}
                isAdmin={admin}
                tag="span"
              />
            </span>
          )}
          {book.genre !== undefined && (
            <span>
              <EditableText
                text={book.genre}
                onSave={saveGenre}
                isAdmin={admin}
                tag="span"
              />
            </span>
          )}
        </div>

        {book.image && (
          <div className={styles.imageWrap}>
            <img
              src={book.image}
              alt={book.title}
              className={styles.image}
              loading="lazy"
              decoding="async"
            />
          </div>
        )}

        {admin && (
          <div className={styles.controls}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={handleFileSelected}
            />
            <button onClick={handleClickChangeImage} disabled={imgBusy}>
              {book.image ? "Change Image" : "Add Image"}
            </button>
            {book.image && (
              <button onClick={handleRemoveImage} disabled={imgBusy}>
                Remove Image
              </button>
            )}
            {imgBusy && <span className={styles.saving}>Saving…</span>}
          </div>
        )}
      </section>

      <section className={styles.description}>
        <EditableText
          text={book.description}
          onSave={saveDescription}
          isAdmin={admin}
          tag="p"
        />
      </section>

      {hasAttachments && <hr className={styles.divider} />}

      <AttachmentRenderer
        attachments={book.attachments || []}
        projectSlug={book.slug}
        onChange={load}
        type="books"
        className={styles.attachments}
      />

      {admin ? (
        <>
          <hr className={styles.divider} />
          <section className={styles.adminTools}>
            <p className={styles.adminTitle}>Admin</p>
            <p className={styles.adminHint}>
              Add references, excerpts, or longer reflections for this book.
            </p>
            <FileUploader
              projectSlug={book.slug}
              onChange={load}
              type="books"
            />
            <TextAttachmentForm
              projectSlug={book.slug}
              onChange={load}
              type="books"
            />
          </section>
        </>
      ) : null}
    </div>
  );
}
