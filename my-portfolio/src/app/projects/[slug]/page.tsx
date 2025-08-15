"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { isAdmin } from "@/utils/auth";
import FileUploader from "@/components/FileUploader";
import AttachmentRenderer from "@/components/AttachmentRenderer";
import type { ProjectData } from "@/utils/projectData";

export default function ProjectDetailPage() {
  const params = useParams();
  const slug =
    typeof params.slug === "string"
      ? params.slug
      : (params.slug as string[])[0];

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgBusy, setImgBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const admin = isAdmin();

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/projects", { cache: "no-store" });
    if (res.ok) {
      const projects: ProjectData[] = await res.json();
      setProject(projects.find((p) => p.slug === slug) || null);
    } else {
      setProject(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [slug]);

  const handleClickChangeImage = () => fileInputRef.current?.click();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;

    try {
      setImgBusy(true);

      // 1) Upload to blob (returns { name, url, pathname, contentType, size })
      const fd = new FormData();
      fd.append("file", file);
      fd.append("filename", file.name);
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!upRes.ok) {
        const err = await upRes.json().catch(() => ({}));
        throw new Error(err?.error || "Upload failed");
      }
      const uploaded = await upRes.json();

      // 2) Tell server to swap the cover image and delete old blob
      const patchRes = await fetch(`/api/projects/${project.slug}/image`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploaded.url,
          imagePathname: uploaded.pathname,
        }),
      });
      if (!patchRes.ok) {
        const err = await patchRes.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to update project image");
      }

      await load();
    } catch (err: any) {
      alert(err?.message || "Failed to change image");
    } finally {
      setImgBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async () => {
    if (!project) return;
    const confirmed = confirm("Remove the project image?");
    if (!confirmed) return;

    try {
      setImgBusy(true);
      const delRes = await fetch(`/api/projects/${project.slug}/image`, {
        method: "DELETE",
      });
      if (!delRes.ok) {
        const err = await delRes.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to remove image");
      }
      await load();
    } catch (err: any) {
      alert(err?.message || "Failed to remove image");
    } finally {
      setImgBusy(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!project) return <p>Project not found.</p>;

  return (
    <div>
      <h1>{project.title}</h1>

      {project.image && (
        <img
          src={project.image}
          alt={project.title}
          style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "8px" }}
        />
      )}

      {admin && (
        <div
          style={{
            margin: "0.75rem 0 1.5rem",
            display: "flex",
            gap: "0.5rem",
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
          <button onClick={handleClickChangeImage} disabled={imgBusy}>
            {project.image ? "Change Image" : "Add Image"}
          </button>
          {project.image && (
            <button onClick={handleRemoveImage} disabled={imgBusy}>
              Remove Image
            </button>
          )}
          {imgBusy && (
            <span style={{ fontSize: 12, opacity: 0.7 }}>Saving…</span>
          )}
        </div>
      )}

      <p>{project.description}</p>

      <hr style={{ margin: "2rem 0" }} />

      <AttachmentRenderer
        attachments={project.attachments || []}
        projectSlug={project.slug}
        onChange={load}
      />

      {admin ? (
        <div>
          <h2>Admin Attachments</h2>
          <FileUploader projectSlug={project.slug} onChange={load} />
        </div>
      ) : (
        <p>
          <em>Attachments coming soon.</em>
        </p>
      )}
    </div>
  );
}
