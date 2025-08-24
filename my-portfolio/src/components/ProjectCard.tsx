"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "@/styles/components/ProjectCard.module.css";
import { isAdmin } from "@/utils/auth";
import EditProjectModal from "@/components/EditProjectModal";

export type ProjectData = {
  title: string;
  description: string;
  slug: string;
  image?: string;
};

type Props = {
  project: ProjectData;
  onDelete?: (slug: string) => void;
  onUpdate?: () => void;
};

export default function ProjectCard({ project, onDelete, onUpdate }: Props) {
  const admin = isAdmin();
  const [editing, setEditing] = useState(false);

  const handleDelete = async () => {
    const confirmed = confirm(`Delete project "${project.title}"?`);
    if (!confirmed) return;

    const res = await fetch(`/api/projects/${project.slug}`, {
      method: "DELETE",
    });

    if (res.ok) {
      onDelete?.(project.slug);
    } else {
      alert("Failed to delete project");
    }
  };

  return (
    <div className={styles.card}>
      <Link href={`/projects/${project.slug}`} className={styles.link}>
        {project.image && (
          <img
            src={project.image}
            alt={project.title}
            className={styles.image}
          />
        )}
        <h3>{project.title}</h3>
        <p>{project.description}</p>
      </Link>
      {admin && (
        <div className={styles.buttonRow}>
          <button onClick={() => setEditing(true)}>✏️ Edit</button>
          <button onClick={handleDelete}>🗑 Delete</button>
        </div>
      )}
      {editing && (
        <EditProjectModal
          project={project}
          onClose={() => setEditing(false)}
          onUpdate={onUpdate ?? (() => {})}
        />
      )}
    </div>
  );
}
