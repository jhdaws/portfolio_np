"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { isAdmin } from "@/utils/auth";
import FileUploader from "@/components/FileUploader";
import AttachmentRenderer from "@/components/AttachmentRenderer";
import type { TrackData } from "@/utils/trackData";
import styles from "@/styles/pages/DetailPage.module.css";
import EditableText from "@/components/EditableText";

export default function TrackDetailPage() {
  const params = useParams();
  const slug =
    typeof params.slug === "string"
      ? params.slug
      : (params.slug as string[])[0];

  const [track, setTrack] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgBusy, setImgBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const admin = isAdmin();

  const saveTitle = async (newTitle: string) => {
    if (!track) return;
    const prev = track;
    setTrack({ ...track, title: newTitle });
    const res = await fetch(`/api/tracks/${track.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (!res.ok) setTrack(prev);
  };

  const saveArtist = async (newArtist: string) => {
    if (!track) return;
    const prev = track;
    setTrack({ ...track, artist: newArtist });
    const res = await fetch(`/api/tracks/${track.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artist: newArtist }),
    });
    if (!res.ok) setTrack(prev);
  };

  const saveDescription = async (newDesc: string) => {
    if (!track) return;
    const prev = track;
    setTrack({ ...track, description: newDesc });
    const res = await fetch(`/api/tracks/${track.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: newDesc }),
    });
    if (!res.ok) setTrack(prev);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/tracks", { cache: "no-store" });
    if (res.ok) {
      const tracks: TrackData[] = await res.json();
      setTrack(tracks.find((p) => p.slug === slug) || null);
    } else {
      setTrack(null);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleClickChangeImage = () => fileInputRef.current?.click();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !track) return;

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

      const patchRes = await fetch(`/api/tracks/${track.slug}/image`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploaded.url,
          imagePathname: uploaded.pathname,
        }),
      });
      if (!patchRes.ok) {
        const err = await patchRes.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to update track image");
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
    if (!track) return;
    const confirmed = confirm("Remove the track image?");
    if (!confirmed) return;

    try {
      setImgBusy(true);
      const delRes = await fetch(`/api/tracks/${track.slug}/image`, {
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
  if (!track) return <p>Track not found.</p>;

  return (
    <div>
      <EditableText
        text={track.title}
        onSave={saveTitle}
        isAdmin={admin}
        tag="h1"
      />
      <p>
        <strong>
          <EditableText
            text={track.artist}
            onSave={saveArtist}
            isAdmin={admin}
            tag="span"
          />
        </strong>
      </p>

      {track.image && (
        <Image
          src={track.image}
          alt={track.title}
          width={800}
          height={600}
          className={styles.image}
          sizes="(max-width: 768px) 90vw, 600px"
          style={{ width: "100%", height: "auto" }}
          unoptimized
        />
      )}

      {admin && (
        <div className={styles.adminImageControls}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={handleFileSelected}
          />
          <button onClick={handleClickChangeImage} disabled={imgBusy}>
            {track.image ? "Change Image" : "Add Image"}
          </button>
          {track.image && (
            <button onClick={handleRemoveImage} disabled={imgBusy}>
              Remove Image
            </button>
          )}
          {imgBusy && <span className={styles.saving}>Saving…</span>}
        </div>
      )}

      <EditableText
        text={track.description}
        onSave={saveDescription}
        isAdmin={admin}
        tag="p"
      />

      <hr className={styles.divider} />

      <AttachmentRenderer
        attachments={track.attachments || []}
        projectSlug={track.slug}
        onChange={load}
        type="tracks"
      />

      {admin ? (
        <div>
          <h2>Admin Attachments</h2>
          <FileUploader projectSlug={track.slug} onChange={load} type="tracks" />
        </div>
      ) : (
        <p>
          <em>Attachments coming soon.</em>
        </p>
      )}
    </div>
  );
}
