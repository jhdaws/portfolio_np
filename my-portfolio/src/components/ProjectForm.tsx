"use client";

import { useState } from "react";
import styles from "@/styles/components/ProjectForm.module.css";
import { useRouter } from "next/navigation";
import projects from "@/data/projects.json";

type Project = {
  title: string;
  description: string;
  image?: string;
  slug: string;
  attachments?: { name: string; url: string }[];
};

type Props = {
  onSubmit: (newProject: any) => void;
  onCancel: () => void;
};

export default function ProjectForm({ onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = title.toLowerCase().replace(/\s+/g, "-");

    const newProject: Project = {
      title,
      description,
      image,
      slug,
      attachments: [],
    };

    const updatedProjects = [...projects, newProject];

    const res = await fetch("/api/projects/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProjects),
    });

    if (res.ok) {
      setTitle("");
      setDescription("");
      setImage("");
      router.refresh();
    } else {
      alert("Failed to save new project");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
      <div>
        <label>Title:</label>
        <br />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Description:</label>
        <br />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Image URL or Path:</label>
        <br />
        <input value={image} onChange={(e) => setImage(e.target.value)} />
      </div>

      <div className={styles.actions}>
        <button type="submit">Save Project</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: "1rem" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
