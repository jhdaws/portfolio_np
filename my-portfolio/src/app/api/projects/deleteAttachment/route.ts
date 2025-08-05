import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { del } from "@vercel/blob";
import type { Attachment, ProjectData } from "@/utils/projectData";

const PROJECTS_PATH = path.join(process.cwd(), "src", "data", "projects.json");

export async function POST(req: NextRequest) {
  const { projectSlug, pathname }: { projectSlug: string; pathname: string } =
    await req.json();

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

    // Filter out the file
    project.attachments = project.attachments.filter(
      (f: Attachment) => f.pathname !== pathname
    );
    await fs.writeFile(PROJECTS_PATH, JSON.stringify(projects, null, 2));

    // Optional: delete from Vercel Blob
    if (pathname) {
      await del(pathname);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete attachment" },
      { status: 500 }
    );
  }
}
