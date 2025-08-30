import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { del } from "@vercel/blob";
import type { PlaylistData } from "@/utils/playlistData";

export const runtime = "nodejs"; // ensure Node for fs

const PLAYLISTS_PATH = path.join(process.cwd(), "src", "data", "playlists.json");

// Detect if a URL points to Vercel Blob; expand this list if you use a custom domain
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

// Prefer pathname; else if we only have a Blob URL, return the URL (del supports URL strings)
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
  const { title, description, url } = await req.json();
  const raw = await fs.readFile(PLAYLISTS_PATH, "utf-8");
  const playlists: PlaylistData[] = JSON.parse(raw);
  const playlist = playlists.find((p) => p.slug === slug);
  if (!playlist) {
    return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
  }
  if (title !== undefined) playlist.title = title;
  if (description !== undefined) playlist.description = description;
  if (url !== undefined) playlist.url = url;
  await fs.writeFile(PLAYLISTS_PATH, JSON.stringify(playlists, null, 2));
  return NextResponse.json(playlist);
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;

    const raw = await fs.readFile(PLAYLISTS_PATH, "utf-8");
    const playlists: PlaylistData[] = JSON.parse(raw);

    const idx = playlists.findIndex((p) => p.slug === slug);
    if (idx === -1) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    const playlist = playlists[idx];

    const imageTarget = getDeleteTargetForImage(
      playlist.image,
      playlist.imagePathname
    );

    if (imageTarget) {
      try {
        await del(imageTarget, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
      } catch (e) {
        console.warn("Failed to delete image blob:", imageTarget, e);
      }
    }

    const remaining = playlists.filter((_, i) => i !== idx);
    await fs.writeFile(PLAYLISTS_PATH, JSON.stringify(remaining, null, 2));

    return NextResponse.json({ ok: true, deletedPlaylist: playlist.slug });
  } catch (err) {
    console.error("Delete playlist error:", err);
    return NextResponse.json(
      { error: "Failed to delete playlist" },
      { status: 500 }
    );
  }
}
