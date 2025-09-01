import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/utils/kvJson";
import { del } from "@vercel/blob";
import type { ProjectData, Attachment } from "@/utils/projectData";

export const runtime = "nodejs";
const KV_KEY = "data/projects.json";

function isVercelBlobUrl(u: string) {
  try {
    const { hostname } = new URL(u);
    return (
      hostname.endsWith(".public.blob.vercel-storage.com") ||
      hostname.endsWith(".blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

function getDeleteTargetForImage(image?: string, imagePathname?: string) {
  if (imagePathname) return imagePathname; // e.g. "/bucket/key-random"
  if (image && isVercelBlobUrl(image)) return image; // full URL fallback
  return undefined;
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const { title, description } = await req.json();
  const projects = await readJson<ProjectData[]>(KV_KEY, []);
  const project = projects.find((p) => p.slug === slug);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  if (title !== undefined) project.title = title;
  if (description !== undefined) project.description = description;
  await writeJson(KV_KEY, projects);
  return NextResponse.json(project);
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;

    const projects = await readJson<ProjectData[]>(KV_KEY, []);

    const idx = projects.findIndex((p) => p.slug === slug);
    if (idx === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projects[idx];
    const attachments: Attachment[] = project.attachments || [];

    const attachmentTargets = attachments
      .map((a) => a.pathname || a.url)
      .filter(Boolean) as string[];

    // Add cover image delete target if applicable
    const imageTarget = getDeleteTargetForImage(
      project.image,
      project.imagePathname
    );
    const deleteTargets = imageTarget
      ? [imageTarget, ...attachmentTargets]
      : attachmentTargets;

    // Best-effort delete all blobs in parallel
    const results = await Promise.allSettled(
      deleteTargets.map((t) =>
        del(t, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })
      )
    );

    // Remove the project and persist
    const remaining = projects.filter((_, i) => i !== idx);
    await writeJson(KV_KEY, remaining);

    const failed = results
      .map((r, i) => ({ r, target: deleteTargets[i] }))
      .filter((x) => x.r.status === "rejected")
      .map((x) => ({
        target: x.target,
        error: String((x.r as PromiseRejectedResult).reason),
      }));

    return NextResponse.json({
      ok: true,
      deletedProject: project.slug,
      blobsAttempted: deleteTargets.length,
      blobsDeleted: deleteTargets.length - failed.length,
      blobsFailed: failed,
    });
  } catch (err) {
    console.error("Delete project error:", err);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
