"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { isAdmin } from "@/utils/auth";
import FileUploader from "@/components/FileUploader";
import AttachmentRenderer from "@/components/AttachmentRenderer";
import type { ProjectData } from "@/utils/projectData";

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const projects = await res.json();
        setProject(projects.find((p: ProjectData) => p.slug === slug) || null);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) return <p>Loading...</p>;
  if (!project) return <p>Project not found.</p>;

  const admin = isAdmin();

  return (
    <div>
      <h1>{project.title}</h1>
      {project.image && (
        <img
          src={project.image}
          alt={project.title}
          style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "8px" }}
        />
      )}
      <p>{project.description}</p>

      <hr style={{ margin: "2rem 0" }} />

      <AttachmentRenderer
        attachments={project.attachments || []}
        projectSlug={project.slug}
      />

      {admin ? (
        <div>
          <h2>Admin Attachments</h2>
          <FileUploader projectSlug={project.slug} />
        </div>
      ) : (
        <p>
          <em>Attachments coming soon.</em>
        </p>
      )}
    </div>
  );
}
