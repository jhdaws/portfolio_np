import { NextRequest, NextResponse } from "next/server";
import {
  getAllProjects,
  saveProjects,
  type ProjectData,
} from "@/utils/projectData";
export const dynamic = "force-dynamic";
// JSON storage now uses Vercel KV; uploads still use Blob

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
  const projects = await getAllProjects();
  return NextResponse.json(projects, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const { title, description, imageUrl, imagePath } = await req.json();
  if (!title || !description) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const projects = await getAllProjects();
  const slug = createSlug(title, new Set(projects.map((p) => p.slug)));

  const newProject: ProjectData = {
    title,
    description,
    image: imageUrl,
    imagePathname: imagePath,
    slug,
    attachments: [],
  };

  projects.push(newProject);
  await saveProjects(projects);

  return NextResponse.json(newProject, { status: 201 });
}
