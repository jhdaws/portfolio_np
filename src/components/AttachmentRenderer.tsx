"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { isAdmin } from "@/utils/auth";
import styles from "@/styles/components/AttachmentRenderer.module.css";
import type { Attachment } from "@/utils/projectData";
import clsx from "clsx";

interface Props {
  attachments: Attachment[];
  projectSlug: string;
  onChange?: () => void;
  type?: "projects" | "books" | "tracks";
  className?: string;
}

export default function AttachmentRenderer({
  attachments,
  projectSlug,
  onChange,
  type = "projects",
  className,
}: Props) {
  const admin = isAdmin();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingBody, setEditingBody] = useState("");
  const [editingSaving, setEditingSaving] = useState(false);

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
  const itemKey = (file: Attachment, index: number) =>
    file.id ?? file.pathname ?? `${file.url ?? "attachment"}-${index}`;
  const attachmentIdFor = (file: Attachment) =>
    file.id ?? file.pathname ?? file.url ?? undefined;

  const handleDelete = async (file: Attachment) => {
    const prev = items;
    setItems(items.filter((a) => a !== file)); // optimistic
    const res = await fetch(`/api/${type}/deleteAttachment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectSlug,
        attachmentId: file.id,
        pathname: file.pathname,
      }),
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
    if (file.type === "note" || (!file.url && file.body)) return "note";
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
    if (kind === "note") {
      return (
        <div className={clsx(styles.previewBox, styles.noteBox)}>
          <div className={styles.noteBody}>
            {(file.body || "").trim() || "—"}
          </div>
        </div>
      );
    }
    if (kind === "image") {
      const url = file.url ?? "";
      return (
        <div className={styles.previewBox}>
          <img
            src={url}
            alt={file.name}
            className={styles.previewImage}
            loading="lazy"
            decoding="async"
          />
        </div>
      );
    }
    if (kind === "video") {
      const url = file.url ?? "";
      return (
        <div className={styles.previewBox}>
          <video src={url} controls className={styles.previewVideo} />
        </div>
      );
    }
    if (kind === "audio") {
      const url = file.url ?? "";
      return (
        <div className={styles.previewBox}>
          <audio src={url} controls className={styles.previewAudio} />
        </div>
      );
    }
    if (kind === "pdf") {
      const url = file.url ?? "";
      return (
        <div className={styles.previewBox}>
          <iframe
            src={`${url}#view=FitH`}
            title={file.name}
            className={styles.previewFrame}
          />
        </div>
      );
    }
    if (kind === "office") {
      const url = file.url ?? "";
      const viewer =
        "https://view.officeapps.live.com/op/embed.aspx?src=" +
        encodeURIComponent(url);
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
        {file.url ? (
          <a href={file.url} target="_blank" rel="noopener noreferrer">
            {file.name}
          </a>
        ) : (
          <span>{file.name}</span>
        )}
      </div>
    );
  };

  const beginNoteEdit = (file: Attachment, key: string) => {
    setEditingId(key);
    setEditingName(file.name ?? "");
    setEditingBody(file.body ?? "");
  };

  const cancelNoteEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingBody("");
    setEditingSaving(false);
  };

  const saveNoteEdit = async (
    file: Attachment,
    key: string,
    index: number
  ) => {
    const trimmedName = editingName.trim();
    const prev = items;
    const updated = items.map((attachment, idx) =>
      idx === index
        ? { ...attachment, name: trimmedName, body: editingBody }
        : attachment
    );

    setEditingSaving(true);
    setItems(updated);

    try {
      const res = await fetch(`/api/${type}/updateAttachment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectSlug,
          attachmentId: attachmentIdFor(file),
          pathname: file.pathname,
          index,
          data: {
            name: trimmedName,
            body: editingBody,
            type: "note",
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to update attachment");
      }

      cancelNoteEdit();
      refresh();
    } catch (err: unknown) {
      setItems(prev);
      const msg = err instanceof Error ? err.message : "Failed to update note";
      alert(msg);
    } finally {
      setEditingSaving(false);
    }
  };

  return (
    <section className={clsx(styles.section, className)}>
      <ul className={styles.list}>
        {items.map((file, i) => {
          const key = itemKey(file, i);
          const isNote = file.type === "note" || (!!file.body && !file.url);
          const isEditing = isNote && editingId === key;
          const showLink = !isNote && !!file.url;
          const showLabel = !isNote && !file.url && !!file.name;
          const showButtons = admin;
          const showActions = showLink || showLabel || showButtons;
          const disableOps = isPending || editingSaving;
          const commonButtons = (
            <>
              <button
                type="button"
                onClick={() => handleDelete(file)}
                disabled={disableOps}
              >
                Delete
              </button>
              <button
                type="button"
                disabled={disableOps || i === 0}
                onClick={() => moveAttachment(i, i - 1)}
                aria-label="Move up"
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={disableOps || i === items.length - 1}
                onClick={() => moveAttachment(i, i + 1)}
                aria-label="Move down"
                title="Move down"
              >
                ↓
              </button>
            </>
          );
          const preview = isEditing ? (
            <div className={styles.noteEdit}>
              <label className={styles.noteLabel}>
                Label
                <input
                  className={styles.noteInput}
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  placeholder="Optional"
                  disabled={editingSaving}
                />
              </label>
              <label className={styles.noteLabel}>
                Text
                <textarea
                  className={styles.noteTextarea}
                  value={editingBody}
                  onChange={(e) => setEditingBody(e.target.value)}
                  rows={6}
                  disabled={editingSaving}
                />
              </label>
            </div>
          ) : (
            <AttachmentPreview file={file} />
          );

          return (
            <li key={key} className={styles.listItem}>
              <div className={styles.info}>
                {preview}
                {showActions && (
                  <div className={styles.actions}>
                    {showLink ? (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.name || "Attachment"}
                      </a>
                    ) : null}
                    {showLabel ? <span>{file.name}</span> : null}
                    {showButtons && (
                      <div className={styles.buttons}>
                        {isNote && !isEditing ? (
                          <button
                            type="button"
                            onClick={() => beginNoteEdit(file, key)}
                            disabled={editingSaving}
                          >
                            Edit
                          </button>
                        ) : null}
                        {isNote && isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveNoteEdit(file, key, i)}
                              disabled={editingSaving}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelNoteEdit}
                              disabled={editingSaving}
                            >
                              Cancel
                            </button>
                          </>
                        ) : null}
                        {commonButtons}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {isPending && <div className={styles.pending}>Saving changes…</div>}
    </section>
  );
}
