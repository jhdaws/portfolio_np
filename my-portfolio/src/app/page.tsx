"use client";

import { useEffect, useRef, useState } from "react";
import EditableText from "@/components/EditableText";
import { isAdmin } from "@/utils/auth";

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
    } catch (err: any) {
      alert(err?.message || "Failed to change image");
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
      const res = await fetch("/api/homepage/image", { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to remove image");
      }
      await load();
    } catch (err: any) {
      alert(err?.message || "Failed to remove image");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !content) return <p>Loading...</p>;

  return (
    <div>
      <EditableText
        text={content.title}
        onSave={saveTitle}
        isAdmin={admin}
        tag="h1"
      />
      <EditableText
        text={content.description}
        onSave={saveDescription}
        isAdmin={admin}
        tag="p"
      />

      {content.image && (
        <img
          src={content.image}
          alt="Homepage"
          style={{
            maxWidth: "100%",
            maxHeight: 420,
            borderRadius: 8,
            marginTop: 12,
          }}
        />
      )}

      {admin && (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
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
          {busy && <span style={{ fontSize: 12, opacity: 0.7 }}>Saving…</span>}
        </div>
      )}
    </div>
  );
}
