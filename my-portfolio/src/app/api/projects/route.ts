import { NextRequest, NextResponse } from "next/server";
import { getAllProjects, saveProjects, type ProjectData } from "@/utils/projectData";

function createSlug(title: string, existing: Set<string>): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  let slug = base;
  let i = 1;
  while (existing.has(slug)) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function GET() {
  const projects = getAllProjects();
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const { title, description, imageUrl } = await req.json();
  if (!title || !description) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const projects = getAllProjects();
  const slug = createSlug(title, new Set(projects.map((p) => p.slug)));

  const newProject: ProjectData = {
    title,
    description,
    image: imageUrl,
    slug,
    attachments: [],
  };

  projects.push(newProject);
  saveProjects(projects);

  return NextResponse.json(newProject, { status: 201 });
}
