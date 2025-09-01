import { NextRequest, NextResponse } from "next/server";
import {
  getAllTracks,
  saveTracks,
  type TrackData,
} from "@/utils/trackData";
export const dynamic = "force-dynamic";
// JSON storage now uses Vercel KV; uploads still use Blob

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
  const tracks = await getAllTracks();
  return NextResponse.json(tracks, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const { title, artist, description, imageUrl, imagePath } = await req.json();
  if (!title || !artist || !description) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const tracks = await getAllTracks();
  const slug = createSlug(title, new Set(tracks.map((p) => p.slug)));

  const newTrack: TrackData = {
    title,
    artist,
    description,
    image: imageUrl,
    imagePathname: imagePath,
    slug,
    attachments: [],
  };

  tracks.push(newTrack);
  await saveTracks(tracks);

  return NextResponse.json(newTrack, { status: 201 });
}
