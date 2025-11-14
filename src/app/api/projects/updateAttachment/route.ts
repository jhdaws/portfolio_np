import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/utils/kvJson";
import type { Attachment, ProjectData } from "@/utils/projectData";

const KV_KEY = "data/projects.json";

type Payload = {
  projectSlug: string;
  attachmentId?: string;
  pathname?: string;
  index?: number;
  data: Partial<Attachment>;
};

export async function POST(req: NextRequest) {
  const { projectSlug, attachmentId, pathname, index, data }: Payload =
    await req.json();

  if (!projectSlug || !data || typeof data !== "object") {
    return NextResponse.json(
      { error: "Missing projectSlug or data" },
      { status: 400 }
    );
  }

  try {
    const projects = await readJson<ProjectData[]>(KV_KEY, []);
    const project = projects.find((p) => p.slug === projectSlug);

    if (!project || !project.attachments) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const attachments = project.attachments;
    const match = (file: Attachment) => {
      if (attachmentId) {
        if (file.id && file.id === attachmentId) return true;
        if (!file.id && file.pathname && file.pathname === attachmentId)
          return true;
      }
      if (pathname && file.pathname && file.pathname === pathname) return true;
      return false;
    };

    let targetIndex = attachments.findIndex(match);

    if (
      targetIndex < 0 &&
      typeof index === "number" &&
      index >= 0 &&
      index < attachments.length
    ) {
      targetIndex = index;
    }

    if (targetIndex < 0) {
      return NextResponse.json(
        { error: "Attachment not found on project" },
        { status: 404 }
      );
    }

    const existing = attachments[targetIndex];
    attachments[targetIndex] = {
      ...existing,
      ...data,
      id: existing.id ?? data.id,
    };

    await writeJson(KV_KEY, projects);

    return NextResponse.json({
      success: true,
      attachment: attachments[targetIndex],
    });
  } catch (err) {
    console.error("Update attachment error:", err);
    return NextResponse.json(
      { error: "Failed to update attachment" },
      { status: 500 }
    );
  }
}
