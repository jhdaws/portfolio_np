"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { isAdmin } from "@/utils/auth";

interface Attachment {
  name: string;
  url: string;
  contentType?: string;
  pathname: string;
}

interface Props {
  attachments: Attachment[];
  projectSlug: string;
  onChange?: () => void;
  type?: "projects" | "books" | "tracks";
}

export default function AttachmentRenderer({
  attachments,
  projectSlug,
  onChange,
  type = "projects",
}: Props) {
  const admin = isAdmin();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [items, setItems] = useState<Attachment[]>(attachments || []);
  useEffect(() => setItems(attachments || []), [attachments]);

  if (!items || items.length === 0) return null;

  const refresh = () => {
    startTransition(() => router.refresh());
    onChange?.();
  };
  const revert = (prev: Attachment[]) => setItems(prev);
  const reorder = (arr: Attachment[], from: number, to: number) => {
    const copy = arr.slice();
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    return copy;
  };

  const handleDelete = async (pathname: string) => {
    const prev = items;
    setItems(items.filter((a) => a.pathname !== pathname)); // optimistic
    const res = await fetch(`/api/${type}/deleteAttachment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectSlug, pathname }),
    });
    if (!res.ok) revert(prev);
    else refresh();
  };

  const moveAttachment = async (fromIndex: number, toIndex: number) => {
    const prev = items;
    setItems(reorder(items, fromIndex, toIndex)); // optimistic
    const res = await fetch(`/api/${type}/reorderAttachment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectSlug, fromIndex, toIndex }),
    });
    if (!res.ok) revert(prev);
    else refresh();
  };

  const getKind = (file: Attachment) => {
    const ct = (file.contentType || "").toLowerCase();
    const byCT = (() => {
      if (ct.startsWith("image/")) return "image";
      if (ct.startsWith("video/")) return "video";
      if (ct.startsWith("audio/")) return "audio";
      if (ct === "application/pdf") return "pdf";
      return "";
    })();

    if (byCT) return byCT;

    // Fallback: detect by extension (handles application/octet-stream / blank CT)
    const name = (file.name || file.url || "").toLowerCase();
    const ext = name.split("?")[0].split("#")[0].split(".").pop() || "";

    const isOneOf = (xs: string[]) => xs.includes(ext);

    if (isOneOf(["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"]))
      return "image";
    if (isOneOf(["mp4", "webm", "ogg", "mov", "m4v"])) return "video";
    if (isOneOf(["mp3", "wav", "ogg", "m4a", "flac"])) return "audio";
    if (isOneOf(["pdf"])) return "pdf";

    // you can extend to "text" if your hosting allows CORS-safe inline viewing
    return "other";
  };

  const box: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 8,
    maxWidth: 640,
    background: "rgba(0,0,0,0.03)",
  };

  const AttachmentPreview = ({ file }: { file: Attachment }) => {
    const kind = useMemo(() => getKind(file), [file]);
    if (kind === "image") {
      // eslint-disable-next-line @next/next/no-img-element
      return (
        <div style={box}>
          <img
            src={file.url}
            alt={file.name}
            style={{ maxWidth: "100%", borderRadius: 6 }}
          />
        </div>
      );
    }
    if (kind === "video") {
      return (
        <div style={box}>
          <video
            src={file.url}
            controls
            style={{ width: "100%", borderRadius: 6 }}
          />
        </div>
      );
    }
    if (kind === "audio") {
      return (
        <div style={box}>
          <audio src={file.url} controls style={{ width: "100%" }} />
        </div>
      );
    }
    if (kind === "pdf") {
      // Note: some storage providers require proper headers for inline PDF.
      // If blocked by CORS, this will still show just the link below.
      return (
        <div style={box}>
          <iframe
            src={`${file.url}#view=FitH`}
            title={file.name}
            style={{
              width: "100%",
              height: 480,
              border: "none",
              borderRadius: 6,
            }}
          />
        </div>
      );
    }
    // Fallback: just show a link
    return (
      <div style={box}>
        <a href={file.url} target="_blank" rel="noopener noreferrer">
          {file.name}
        </a>
      </div>
    );
  };

  return (
    <section>
      <h3 style={{ marginBottom: 8 }}>Attachments</h3>
      <ul
        style={{
          listStyle: "none",
          paddingLeft: 0,
          margin: 0,
          display: "grid",
          gap: "1rem",
        }}
      >
        {items.map((file, i) => (
          <li key={file.pathname ?? `${file.url}-${i}`}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
              }}
            >
              <div style={{ flex: 1 }}>
                <AttachmentPreview file={file} />
                <div
                  style={{
                    marginTop: 6,
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
                      <button
                        onClick={() => handleDelete(file.pathname)}
                        disabled={isPending}
                      >
                        Delete
                      </button>
                      <button
                        disabled={i === 0 || isPending}
                        onClick={() => moveAttachment(i, i - 1)}
                        aria-label="Move up"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        disabled={i === items.length - 1 || isPending}
                        onClick={() => moveAttachment(i, i + 1)}
                        aria-label="Move down"
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {isPending && (
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
          Saving changes…
        </div>
      )}
    </section>
  );
}
