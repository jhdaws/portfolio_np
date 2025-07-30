"use client";

import { useState } from "react";
import styles from "@/styles/components/FileUploader.module.css";
import projects from "@/data/projects.json";

type UploadedFile = {
  name: string;
  url: string;
};

type Props = {
  projectSlug: string;
};

export default function FileUploader({ projectSlug }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>(
    projects.find((p) => p.slug === projectSlug)?.attachments || []
  );

  const handleUpload = async (file: File) => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      alert("Upload failed");
      return;
    }

    const blob = await res.json();
    const uploaded: UploadedFile = {
      name: file.name,
      url: blob.url,
    };

    const updatedProjects = projects.map((p) =>
      p.slug === projectSlug
        ? {
            ...p,
            attachments: [...(p.attachments || []), uploaded],
          }
        : p
    );

    // Save to backend
    const saveRes = await fetch("/api/projects/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProjects),
    });

    if (!saveRes.ok) {
      alert("Failed to save project metadata");
      return;
    }

    setFiles((prev) => [...prev, uploaded]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(handleUpload);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={styles.dropZone}
      >
        <p>Drag & drop files here to upload</p>
      </div>

      <div className={styles.fileList}>
        {files.map((file, i) => (
          <div key={i} className={styles.fileItem}>
            <strong>{file.name}</strong>
            <div>
              {file.url.endsWith(".pdf") && (
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  📄 Open PDF
                </a>
              )}
              {file.url.match(/\.(mp4|webm)$/) && (
                <video src={file.url} controls style={{ maxWidth: "300px" }} />
              )}
              {file.url.match(/\.(mp3|wav)$/) && (
                <audio src={file.url} controls />
              )}
              {!file.url.match(/\.(pdf|mp4|webm|mp3|wav)$/) && (
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  📁 Download
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
