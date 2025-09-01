import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/utils/kvJson";
import { del } from "@vercel/blob";
import type { Attachment, ProjectData } from "@/utils/projectData";

export const runtime = "nodejs";
const KV_KEY = "data/projects.json";

export async function POST(req: NextRequest) {
  const { projectSlug, pathname }: { projectSlug: string; pathname: string } =
    await req.json();

  if (!projectSlug || !pathname) {
    return NextResponse.json(
      { error: "Missing projectSlug or pathname" },
      { status: 400 }
    );
  }

  try {
    const projects = await readJson<ProjectData[]>(KV_KEY, []);

    const project = projects.find((p) => p.slug === projectSlug);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const before = project.attachments?.length ?? 0;

    // Remove attachment from the project
    project.attachments = (project.attachments || []).filter(
      (f: Attachment) => f.pathname !== pathname
    );

    if ((project.attachments?.length ?? 0) === before) {
      // Attachment not found on this project; don't attempt deletion
      return NextResponse.json(
        { error: "Attachment not found on project" },
        { status: 404 }
      );
    }

    // Persist update first
    await writeJson(KV_KEY, projects);

    // Delete the blob (uploads use addRandomSuffix, so safe to delete directly)
    await del(pathname, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete attachment error:", err);
    return NextResponse.json(
      { error: "Failed to delete attachment" },
      { status: 500 }
    );
  }
}
