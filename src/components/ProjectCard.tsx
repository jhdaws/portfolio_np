"use client";

import Image from "next/image";
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
          <div className={styles.media}>
            <Image
              src={project.image}
              alt={project.title}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 90vw, 420px"
              unoptimized
            />
          </div>
        )}
        <div className={styles.meta}>
          <h3 className={styles.title}>{project.title}</h3>
          <p className={styles.description}>{project.description}</p>
        </div>
      </Link>
      {admin && (
        <div className={styles.buttonRow}>
          <button onClick={handleDelete}>🗑 Delete</button>
        </div>
      )}
    </div>
  );
}
