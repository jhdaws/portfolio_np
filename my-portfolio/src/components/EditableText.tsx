"use client";

import { useState, JSX } from "react";
import styles from "@/styles/components/EditableText.module.css";

type Props = {
  text: string;
  onSave: (newText: string) => void;
  isAdmin: boolean;
  tag?: keyof JSX.IntrinsicElements;
};

export default function EditableText({
  text,
  onSave,
  isAdmin,
  tag = "p",
}: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);

  const Tag = tag;

  if (!isAdmin) return <Tag>{text}</Tag>;

  return editing ? (
    <div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={tag === "h1" ? 1 : 3}
        className={styles.textarea}
      />
      <div className={styles.buttons}>
        <button
          onClick={() => {
            onSave(value);
            setEditing(false);
          }}
        >
          Save
        </button>
        <button onClick={() => setEditing(false)}>Cancel</button>
      </div>
    </div>
  ) : (
    <div className={styles.container}>
      <Tag>{text}</Tag>
      <button
        onClick={() => setEditing(true)}
        aria-label="Edit"
        className={styles.editButton}
      >
        ✏️
      </button>
    </div>
  );
}
