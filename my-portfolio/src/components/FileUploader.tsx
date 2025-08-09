"use client";

import { useState } from "react";
import styles from "@/styles/components/FileUploader.module.css";
import { isAdmin } from "@/utils/auth";
import type { Attachment } from "@/utils/projectData";

interface Props {
  projectSlug: string;
  onUpload?: (file: Attachment) => void;
}

export default function FileUploader({ projectSlug, onUpload }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await uploadFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);

    for (const file of files) {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: (() => {
          const form = new FormData();
          form.append("file", file);
          return form;
        })(),
      });

      if (res.ok) {
        const { url, contentType, pathname } = await res.json();

        // Save reference to project JSON
        await fetch(`/api/projects/attach`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectSlug,
            file: { url, contentType, name: file.name, pathname },
          }),
        });

        onUpload?.({ url, contentType, name: file.name, pathname });
      }
    }

    setUploading(false);
  };

  return isAdmin() ? (
    <div className={styles.wrapper}>
      <label className={styles.dropzone}>
        <input
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={handleFileInput}
        />
        <div
          className={styles.dropbox}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {uploading
            ? "Uploading..."
            : isDragging
            ? "Drop files here"
            : "Click or drag files here to upload"}
        </div>
      </label>
    </div>
  ) : null;
}
