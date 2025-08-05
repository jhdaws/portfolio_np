"use client";

import { isAdmin } from "@/utils/auth";

interface Attachment {
  name: string;
  url: string;
  contentType: string;
  pathname: string;
}

interface Props {
  attachments: Attachment[];
  projectSlug: string;
  onDelete?: () => void;
}

export default function AttachmentRenderer({
  attachments,
  projectSlug,
  onDelete,
}: Props) {
  if (!attachments || attachments.length === 0) return null;

  const handleDelete = async (pathname: string) => {
    const res = await fetch("/api/projects/deleteAttachment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectSlug, pathname }),
    });

    if (res.ok && onDelete) {
      onDelete();
    }
  };

  return (
    <section>
      <h3>Attachments</h3>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {attachments.map((file, i) => (
          <li key={i} style={{ marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong>{file.name}</strong>
              {isAdmin() && (
                <button
                  onClick={() => handleDelete(file.pathname)}
                  style={{ marginLeft: "1rem" }}
                >
                  🗑 Delete
                </button>
              )}
            </div>
            <div style={{ marginTop: "0.5rem" }}>
              {file.contentType.startsWith("image/") && (
                <img
                  src={file.url}
                  alt={file.name}
                  style={{ maxWidth: "100%" }}
                />
              )}
              {file.contentType.startsWith("video/") && (
                <video src={file.url} controls style={{ maxWidth: "100%" }} />
              )}
              {file.contentType === "application/pdf" && (
                <iframe
                  src={file.url}
                  style={{ width: "100%", height: "400px" }}
                  title={file.name}
                />
              )}
              {!file.contentType.startsWith("image/") &&
                !file.contentType.startsWith("video/") &&
                file.contentType !== "application/pdf" && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    Download
                  </a>
                )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
