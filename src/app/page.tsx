"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import EditableText from "@/components/EditableText";
import { isAdmin } from "@/utils/auth";
import Link from "next/link";
import styles from "@/styles/pages/Home.module.css";
import { FaBook, FaEnvelope, FaMusic, FaProjectDiagram } from "react-icons/fa";

type HomeContent = {
  title: string;
  description: string;
  image?: string | null;
  imagePathname?: string | null;
};

export default function HomePage() {
  const admin = isAdmin();
  const [content, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/homepage", { cache: "no-store" });
    if (res.ok) {
      setContent(await res.json());
    } else {
      setContent(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const saveTitle = async (newTitle: string) => {
    if (!content) return;
    const prev = content;
    setContent({ ...content, title: newTitle }); // optimistic
    const res = await fetch("/api/homepage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (!res.ok) setContent(prev); // rollback on failure
  };

  const saveDescription = async (newDesc: string) => {
    if (!content) return;
    const prev = content;
    setContent({ ...content, description: newDesc }); // optimistic
    const res = await fetch("/api/homepage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: newDesc }),
    });
    if (!res.ok) setContent(prev);
  };

  const handleClickChangeImage = () => fileInputRef.current?.click();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBusy(true);
      // Upload to blob
      const fd = new FormData();
      fd.append("file", file);
      fd.append("filename", file.name);
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!upRes.ok) {
        const err = await upRes.json().catch(() => ({}));
        throw new Error(err?.error || "Upload failed");
      }
      const uploaded = await upRes.json(); // { url, pathname, ... }

      // Patch homepage image (server deletes old blob)
      const patchRes = await fetch("/api/homepage/image", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploaded.url,
          imagePathname: uploaded.pathname,
        }),
      });
      if (!patchRes.ok) {
        const err = await patchRes.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to update image");
      }

      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg || "Failed to change image");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async () => {
    const confirmed = confirm("Remove homepage image?");
    if (!confirmed) return;

    try {
      setBusy(true);
      const prev = content;
      // Optimistic UI: hide image immediately
      if (content) setContent({ ...content, image: null, imagePathname: null });

      const res = await fetch("/api/homepage/image", { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // rollback on failure
        if (prev) setContent(prev);
        throw new Error(err?.error || "Failed to remove image");
      }
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg || "Failed to remove image");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !content) return <p>Loading...</p>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <div className={styles.text}>
          <div className={styles.title}>
            <EditableText
              text={content.title ?? ""}
              onSave={saveTitle}
              isAdmin={admin}
              tag="h1"
            />
          </div>
          <div className={styles.description}>
            <EditableText
              text={content.description ?? ""}
              onSave={saveDescription}
              isAdmin={admin}
              tag="p"
            />
          </div>

          {admin && (
            <div className={styles.adminControls}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={handleFileSelected}
              />
              <button onClick={handleClickChangeImage} disabled={busy}>
                {content.image ? "Change Image" : "Add Image"}
              </button>
              {content.image && (
                <button onClick={handleRemoveImage} disabled={busy}>
                  Remove Image
                </button>
              )}
              {busy && <span className={styles.saving}>Saving…</span>}
            </div>
          )}
        </div>

        {content.image && (
          <div className={styles.imageWrapper}>
            <Image
              src={content.image}
              alt="Homepage"
              width={1200}
              height={800}
              className={styles.image}
              sizes="(max-width: 768px) 90vw, 600px"
              style={{ width: "100%", height: "auto" }}
              unoptimized
            />
          </div>
        )}
      </div>

      <nav className={styles.nav}>
        <Link href="/projects" className={styles.navButton}>
          <FaProjectDiagram size={40} />
          <span>Projects</span>
        </Link>
        <Link href="/bookshelf" className={styles.navButton}>
          <FaBook size={40} />
          <span>Bookshelf</span>
        </Link>
        <Link href="/music" className={styles.navButton}>
          <FaMusic size={40} />
          <span>Music</span>
        </Link>
      </nav>

      <div className={styles.contact}>
        <Link href="/contact" className={styles.contactButton}>
          <FaEnvelope size={40} />
          Contact
        </Link>
      </div>
    </div>
  );
}
