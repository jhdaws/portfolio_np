import { NextRequest, NextResponse } from "next/server";
import {
  getAllPlaylists,
  savePlaylists,
  type PlaylistData,
} from "@/utils/playlistData";

function createSlug(title: string, existing: Set<string>): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  let slug = base;
  let i = 1;
  while (existing.has(slug)) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function GET() {
  const playlists = getAllPlaylists();
  return NextResponse.json(playlists);
}

export async function POST(req: NextRequest) {
  const { title, description, url, imageUrl, imagePath } = await req.json();
  if (!title || !description || !url) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const playlists = getAllPlaylists();
  const slug = createSlug(title, new Set(playlists.map((p) => p.slug)));

  const newPlaylist: PlaylistData = {
    title,
    description,
    url,
    image: imageUrl,
    imagePathname: imagePath,
    slug,
  };

  playlists.push(newPlaylist);
  savePlaylists(playlists);

  return NextResponse.json(newPlaylist, { status: 201 });
}
