import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/utils/kvJson";
import type { Attachment, ProjectData } from "@/utils/projectData";

const KV_KEY = "data/projects.json";

export async function POST(req: NextRequest) {
  const { projectSlug, file }: { projectSlug: string; file: Attachment } =
    await req.json();

  try {
    const projects = await readJson<ProjectData[]>(KV_KEY, []);

    const project = projects.find((p) => p.slug === projectSlug);
    if (!project)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });

    if (!project.attachments) project.attachments = [];
    project.attachments.push(file);

    await writeJson(KV_KEY, projects);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Attach error:", err);
    return NextResponse.json(
      { error: "Failed to attach file" },
      { status: 500 }
    );
  }
}
