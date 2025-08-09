"use client";

import Link from "next/link";
import styles from "@/styles/components/ProjectCard.module.css";
import { isAdmin } from "@/utils/auth";

export type ProjectData = {
  title: string;
  description: string;
  slug: string;
  image?: string;
};

type Props = {
  project: ProjectData;
  onDelete?: (slug: string) => void;
};

export default function ProjectCard({ project, onDelete }: Props) {
  const admin = isAdmin();

  const handleDelete = async () => {
    const confirmed = confirm(`Delete project "${project.title}"?`);
    if (!confirmed) return;

    const res = await fetch("/api/projects/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: project.slug }),
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
        <button onClick={handleDelete} className={styles.deleteButton}>
          🗑 Delete
        </button>
      )}
    </div>
  );
}
