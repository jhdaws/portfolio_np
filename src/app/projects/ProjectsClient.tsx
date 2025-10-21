"use client";

import { useEffect, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import NewProjectModal from "@/components/NewProjectModal";
import styles from "@/styles/pages/Projects.module.css";
import { isAdmin } from "@/utils/auth";
import type { ProjectData } from "@/utils/projectData";

export default function ProjectsClient() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const admin = isAdmin();

  const loadProjects = async () => {
    const res = await fetch("/api/projects", { cache: "no-store" });
    if (res.ok) {
      setProjects(await res.json());
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleAddProject = () => {
    loadProjects();
  };

  const handleDeleteProject = (slug: string) => {
    setProjects((prev) => prev.filter((p) => p.slug !== slug));
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Projects</h1>
      {admin && (
        <>
          <div className={styles.actions}>
            <button
              className={styles.primaryButton}
              onClick={() => setShowModal(true)}
            >
              Add New Project
            </button>
          </div>
          {showModal && (
            <NewProjectModal
              onClose={handleCloseModal}
              onAdd={handleAddProject}
            />
          )}
        </>
      )}
      <div className={styles.grid}>
        {projects.map((p) => (
          <ProjectCard
            key={p.slug}
            project={p}
            onDelete={handleDeleteProject}
          />
        ))}
      </div>
    </div>
  );
}
