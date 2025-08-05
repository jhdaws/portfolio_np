"use client";

import { useEffect, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import NewProjectModal from "@/components/NewProjectModal";
import styles from "@/styles/pages/Projects.module.css";
import { isAdmin } from "@/utils/auth";
import type { ProjectData } from "@/utils/projectData";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const admin = isAdmin();

  const loadProjects = async () => {
    const res = await fetch("/api/projects");
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

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      {admin && (
        <>
          <button onClick={() => setShowModal(true)}>Add New Project</button>
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
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </div>
  );
}
