import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/utils/kvJson";
import { del } from "@vercel/blob";
import type { ProjectData } from "@/utils/projectData";

export const runtime = "nodejs";
const KV_KEY = "data/projects.json";

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

    const projects = await readJson<ProjectData[]>(KV_KEY, []);
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
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
      } catch (e) {
        // best-effort: log and continue
        console.warn("Failed to delete old image blob:", oldTarget, e);
      }
    }

    // Save new image fields
    proj.image = image;
    proj.imagePathname = imagePathname;

    await writeJson(KV_KEY, projects);

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

    const projects = await readJson<ProjectData[]>(KV_KEY, []);
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
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
      } catch (e) {
        console.warn("Failed to delete image blob:", target, e);
      }
    }

    // Clear image fields
    proj.image = undefined;
    proj.imagePathname = undefined;

    await writeJson(KV_KEY, projects);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE image error:", err);
    return NextResponse.json(
      { error: "Failed to remove image" },
      { status: 500 }
    );
  }
}
