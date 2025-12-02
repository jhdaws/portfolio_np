"use client";

import { useEffect, useState } from "react";
import pageStyles from "@/styles/pages/Projects.module.css";
import galleryStyles from "@/styles/pages/Gallery.module.css";
import GalleryCard from "@/components/GalleryCard";
import NewGalleryModal from "@/components/NewGalleryModal";
import { isAdmin } from "@/utils/auth";
import type { GalleryItem } from "@/utils/galleryData";

export default function GalleryClient() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const admin = isAdmin();

  const loadItems = async () => {
    const res = await fetch("/api/gallery", { cache: "no-store" });
    if (res.ok) {
      setItems(await res.json());
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = (slug: string) => {
    setItems((prev) => prev.filter((item) => item.slug !== slug));
  };

  return (
    <div className={pageStyles.container}>
      <h1 className={pageStyles.title}>Gallery</h1>
      {admin && (
        <>
          <div className={pageStyles.actions}>
            <button onClick={() => setShowModal(true)}>
              Add Image
            </button>
          </div>
          {showModal && (
            <NewGalleryModal
              onClose={() => setShowModal(false)}
              onAdd={loadItems}
            />
          )}
        </>
      )}
      <div className={`${pageStyles.grid} ${galleryStyles.grid}`}>
        {items.map((item) => (
          <GalleryCard
            key={item.slug}
            item={item}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
