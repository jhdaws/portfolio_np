import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/utils/kvJson";
import type { ProjectData } from "@/utils/projectData";

const KV_KEY = "data/projects.json";

export async function POST(req: NextRequest) {
  const { projectSlug, fromIndex, toIndex } = await req.json();

  try {
    const projects = await readJson<ProjectData[]>(KV_KEY, []);

    const project = projects.find((p) => p.slug === projectSlug);
    if (!project || !project.attachments) {
      return NextResponse.json(
        { error: "Project or attachments not found" },
        { status: 404 }
      );
    }

    const [moved] = project.attachments.splice(fromIndex, 1);
    project.attachments.splice(toIndex, 0, moved);

    await writeJson(KV_KEY, projects);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reorder error:", err);
    return NextResponse.json(
      { error: "Failed to reorder attachment" },
      { status: 500 }
    );
  }
}
