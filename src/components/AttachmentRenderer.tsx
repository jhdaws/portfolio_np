"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { isAdmin } from "@/utils/auth";
import styles from "@/styles/components/AttachmentRenderer.module.css";

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
      // Common Office MIME types
      if (
        [
          "application/msword",
          "application/vnd.ms-word",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ].includes(ct)
      )
        return "office";
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
    if (isOneOf(["doc", "docx", "xls", "xlsx", "ppt", "pptx"])) return "office";

    return "other";
  };

  const AttachmentPreview = ({ file }: { file: Attachment }) => {
    const kind = useMemo(() => getKind(file), [file]);
    if (kind === "image") {
      return (
        <div className={styles.previewBox}>
          <Image
            src={file.url}
            alt={file.name}
            width={1000}
            height={1000}
            className={styles.previewImage}
            sizes="(max-width: 900px) 90vw, 600px"
            style={{ width: "100%", height: "100%" }}
            unoptimized
          />
        </div>
      );
    }
    if (kind === "video") {
      return (
        <div className={styles.previewBox}>
          <video src={file.url} controls className={styles.previewVideo} />
        </div>
      );
    }
    if (kind === "audio") {
      return (
        <div className={styles.previewBox}>
          <audio src={file.url} controls className={styles.previewAudio} />
        </div>
      );
    }
    if (kind === "pdf") {
      return (
        <div className={styles.previewBox}>
          <iframe
            src={`${file.url}#view=FitH`}
            title={file.name}
            className={styles.previewFrame}
          />
        </div>
      );
    }
    if (kind === "office") {
      const viewer =
        "https://view.officeapps.live.com/op/embed.aspx?src=" +
        encodeURIComponent(file.url);
      return (
        <div className={styles.previewBox}>
          <iframe
            src={viewer}
            title={file.name}
            className={styles.previewFrame}
          />
        </div>
      );
    }
    // Fallback: just show a link
    return (
      <div className={styles.previewBox}>
        <a href={file.url} target="_blank" rel="noopener noreferrer">
          {file.name}
        </a>
      </div>
    );
  };

  return (
    <section>
      <h3 className={styles.heading}>Attachments</h3>
      <ul className={styles.list}>
        {items.map((file, i) => (
          <li
            key={file.pathname ?? `${file.url}-${i}`}
            className={styles.listItem}
          >
            <div className={styles.info}>
              <AttachmentPreview file={file} />
              <div className={styles.actions}>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  {file.name}
                </a>
                {admin && (
                  <div className={styles.buttons}>
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
          </li>
        ))}
      </ul>
      {isPending && <div className={styles.pending}>Saving changes…</div>}
    </section>
  );
}
