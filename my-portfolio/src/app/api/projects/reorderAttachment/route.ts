import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import type { ProjectData } from "@/utils/projectData";

const PROJECTS_PATH = path.join(process.cwd(), "src", "data", "projects.json");

export async function POST(req: NextRequest) {
  const { projectSlug, fromIndex, toIndex } = await req.json();

  try {
    const fileData = await fs.readFile(PROJECTS_PATH, "utf-8");
    const projects: ProjectData[] = JSON.parse(fileData);

    const project = projects.find((p) => p.slug === projectSlug);
    if (!project || !project.attachments) {
      return NextResponse.json(
        { error: "Project or attachments not found" },
        { status: 404 }
      );
    }

    const [moved] = project.attachments.splice(fromIndex, 1);
    project.attachments.splice(toIndex, 0, moved);

    await fs.writeFile(PROJECTS_PATH, JSON.stringify(projects, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reorder error:", err);
    return NextResponse.json(
      { error: "Failed to reorder attachment" },
      { status: 500 }
    );
  }
}
