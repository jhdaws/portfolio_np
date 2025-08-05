import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

const PROJECTS_PATH = path.join(process.cwd(), "src", "data", "projects.json");

export async function POST(req: NextRequest) {
  const { projectSlug, file } = await req.json();

  try {
    const fileData = await fs.readFile(PROJECTS_PATH, "utf-8");
    const projects = JSON.parse(fileData);

    const project = projects.find((p: any) => p.slug === projectSlug);
    if (!project)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });

    if (!project.attachments) project.attachments = [];
    project.attachments.push(file);

    await fs.writeFile(PROJECTS_PATH, JSON.stringify(projects, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Attach error:", err);
    return NextResponse.json(
      { error: "Failed to attach file" },
      { status: 500 }
    );
  }
}
