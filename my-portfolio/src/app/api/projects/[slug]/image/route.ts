import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { del } from "@vercel/blob";
import type { ProjectData } from "@/utils/projectData";

export const runtime = "nodejs";

const PROJECTS_PATH = path.join(process.cwd(), "src", "data", "projects.json");

// Detect if a URL points to Vercel Blob
function isVercelBlobUrl(u?: string) {
  if (!u) return false;
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

// Prefer pathname; else if only a Blob URL exists, use URL (del supports both)
function targetFrom(image?: string, imagePathname?: string) {
  if (imagePathname) return imagePathname;
  if (image && isVercelBlobUrl(image)) return image;
  return undefined;
}

// PATCH /api/projects/[slug]/image
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;
    const { image, imagePathname } = (await req.json()) as {
      image: string;
      imagePathname?: string;
    };

    if (!image) {
      return NextResponse.json({ error: "Missing image" }, { status: 400 });
    }

    const raw = await fs.readFile(PROJECTS_PATH, "utf-8");
    const projects: ProjectData[] = JSON.parse(raw);
    const idx = projects.findIndex((p) => p.slug === slug);
    if (idx === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const proj = projects[idx];

    // Delete old image blob if we have a target
    const oldTarget = targetFrom(proj.image, proj.imagePathname);
    if (oldTarget) {
      try {
        await del(oldTarget, {
          // token: process.env.BLOB_READ_WRITE_TOKEN,
        });
      } catch (e) {
        // best-effort: log and continue
        console.warn("Failed to delete old image blob:", oldTarget, e);
      }
    }

    // Save new image fields
    proj.image = image;
    proj.imagePathname = imagePathname;

    await fs.writeFile(PROJECTS_PATH, JSON.stringify(projects, null, 2));

    return NextResponse.json({ ok: true, image, imagePathname });
  } catch (err) {
    console.error("PATCH image error:", err);
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[slug]/image
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;

    const raw = await fs.readFile(PROJECTS_PATH, "utf-8");
    const projects: ProjectData[] = JSON.parse(raw);
    const idx = projects.findIndex((p) => p.slug === slug);
    if (idx === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const proj = projects[idx];

    // Delete current image blob if we can address it
    const target = targetFrom(proj.image, proj.imagePathname);
    if (target) {
      try {
        await del(target, {
          // token: process.env.BLOB_READ_WRITE_TOKEN,
        });
      } catch (e) {
        console.warn("Failed to delete image blob:", target, e);
      }
    }

    // Clear image fields
    proj.image = undefined;
    proj.imagePathname = undefined;

    await fs.writeFile(PROJECTS_PATH, JSON.stringify(projects, null, 2));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE image error:", err);
    return NextResponse.json(
      { error: "Failed to remove image" },
      { status: 500 }
    );
  }
}
