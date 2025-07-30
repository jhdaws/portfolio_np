"use client";

import { useParams } from "next/navigation";
import projects from "@/data/projects.json";
import { isAdmin } from "@/utils/auth";
import FileUploader from "@/components/FileUploader";

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);

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
