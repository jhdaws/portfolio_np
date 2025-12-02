import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/utils/kvJson";
import { del } from "@vercel/blob";
import type { GalleryItem } from "@/utils/galleryData";

const KV_KEY = "data/gallery.json";

function isVercelBlobUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return (
      hostname.endsWith(".public.blob.vercel-storage.com") ||
      hostname.endsWith(".blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

function getDeleteTarget(image?: string, pathname?: string) {
  if (pathname) return pathname;
  if (image && isVercelBlobUrl(image)) return image;
  return undefined;
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;
    const items = await readJson<GalleryItem[]>(KV_KEY, []);
    const idx = items.findIndex((i) => i.slug === slug);
    if (idx === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const item = items[idx];
    const target = getDeleteTarget(item.image, item.imagePathname);
    if (target) {
      await del(target, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    }

    const remaining = items.filter((_, i) => i !== idx);
    await writeJson(KV_KEY, remaining);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete gallery item error:", err);
    return NextResponse.json(
      { error: "Failed to delete gallery item" },
      { status: 500 }
    );
  }
}
