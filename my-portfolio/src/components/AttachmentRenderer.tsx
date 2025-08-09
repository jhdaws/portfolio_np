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
  onChange?: () => void;
}

export default function AttachmentRenderer({
  attachments,
  projectSlug,
  onChange,
}: Props) {
  if (!attachments || attachments.length === 0) return null;

  const handleDelete = async (pathname: string) => {
    const res = await fetch("/api/projects/deleteAttachment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectSlug, pathname }),
    });

    if (res.ok && onChange) {
      onChange();
    }
  };

  const moveAttachment = async (fromIndex: number, toIndex: number) => {
    const res = await fetch("/api/projects/reorderAttachment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectSlug, fromIndex, toIndex }),
    });

    if (res.ok && onChange) {
      onChange();
    }
  };

  const admin = isAdmin();

  return (
    <section>
      <h3>Attachments</h3>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {attachments.map((file, i) => (
          <li key={i} style={{ marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                {file.name}
              </a>

              {admin && (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleDelete(file.pathname)}>
                    Delete
                  </button>
                  <button
                    disabled={i === 0}
                    onClick={() => moveAttachment(i, i - 1)}
                  >
                    ↑
                  </button>
                  <button
                    disabled={i === attachments.length - 1}
                    onClick={() => moveAttachment(i, i + 1)}
                  >
                    ↓
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
