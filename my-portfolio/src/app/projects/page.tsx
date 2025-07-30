"use client";

import { useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import ProjectForm from "@/components/ProjectForm";
import { isAdmin } from "@/utils/auth";
import initialProjects from "@/data/projects.json";

export default function ProjectsPage() {
  const admin = isAdmin();
  const [projects, setProjects] = useState(initialProjects);
  const [showForm, setShowForm] = useState(false);

  const handleAddProject = (newProject: any) => {
    const slug = newProject.title.toLowerCase().replace(/\s+/g, "-");
    setProjects([...projects, { ...newProject, slug }]);
    setShowForm(false);
  };

  return (
    <div>
      <h1>Projects</h1>
      {admin && (
        <>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{ marginBottom: "1rem" }}
            >
              ➕ Add New Project
            </button>
          )}
          {showForm && (
            <ProjectForm
              onSubmit={handleAddProject}
              onCancel={() => setShowForm(false)}
            />
          )}
        </>
      )}
      {projects.map((project) => (
        <ProjectCard
          key={project.slug}
          slug={project.slug}
          title={project.title}
          description={project.description}
          image={project.image}
        />
      ))}
    </div>
  );
}
