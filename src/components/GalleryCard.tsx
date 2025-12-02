"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "@/styles/components/GalleryCard.module.css";
import { isAdmin } from "@/utils/auth";
import type { GalleryItem } from "@/utils/galleryData";

interface Props {
  item: GalleryItem;
  onDelete?: (slug: string) => void;
}

export default function GalleryCard({ item, onDelete }: Props) {
  const admin = isAdmin();
  const [showFull, setShowFull] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this gallery entry?")) return;
    const res = await fetch(`/api/gallery/${item.slug}`, {
      method: "DELETE",
    });
    if (res.ok) {
      onDelete?.(item.slug);
    } else {
      alert("Failed to delete image");
    }
  };

  return (
    <>
      <article className={styles.card}>
        <div
          className={styles.media}
          role="button"
          tabIndex={0}
          onClick={() => setShowFull(true)}
          onKeyDown={(e) => e.key === "Enter" && setShowFull(true)}
        >
          <Image
            src={item.image}
            alt={item.description ?? item.location}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 90vw, 420px"
            unoptimized
          />
        </div>
        <div className={styles.meta}>
          <p className={styles.location}>{item.location}</p>
          <p className={styles.date}>{item.date}</p>
          <p className={styles.description}>{item.description}</p>
        </div>
        {admin && (
          <div className={styles.actions}>
            <button onClick={handleDelete}>Delete</button>
          </div>
        )}
      </article>
      {showFull && (
        <div
          className={styles.lightbox}
          onClick={() => setShowFull(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={item.image}
              alt={item.description ?? item.location}
              fill
              className={styles.lightboxImage}
              sizes="90vw"
              unoptimized
            />
            <button
              className={styles.lightboxClose}
              onClick={() => setShowFull(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
