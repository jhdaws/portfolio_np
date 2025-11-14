"use client";

import { useState } from "react";
import styles from "@/styles/components/TextAttachmentForm.module.css";
import { isAdmin } from "@/utils/auth";

type Props = {
  projectSlug: string;
  onChange?: () => void | Promise<void>;
  type?: "projects" | "books" | "tracks";
};

export default function TextAttachmentForm({
  projectSlug,
  onChange,
  type = "projects",
}: Props) {
  const admin = isAdmin();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setBody("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const content = body.trim();
    if (!content) {
      setError("Add some text before saving.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await fetch(`/api/${type}/attach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectSlug,
          file: {
            type: "note",
            name: title.trim() || "Note",
            body: content,
          },
        }),
      });
      reset();
      if (onChange) await onChange();
    } catch (err) {
      console.error(err);
      setError("Failed to save note.");
    } finally {
      setSaving(false);
    }
  };

  if (!admin) return null;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.heading}>Add Text Attachment</h3>
      <label className={styles.label}>
        Title
        <input
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Optional title"
        />
      </label>
      <label className={styles.label}>
        Text
        <textarea
          className={styles.textarea}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your notes…"
          rows={5}
        />
      </label>
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.button} type="submit" disabled={saving}>
        {saving ? "Saving…" : "Add Text Attachment"}
      </button>
    </form>
  );
}
