import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { del } from "@vercel/blob";
import type { Attachment } from "@/utils/projectData";
import type { TrackData } from "@/utils/trackData";

const TRACKS_PATH = path.join(process.cwd(), "src", "data", "tracks.json");

export async function POST(req: NextRequest) {
  const { projectSlug, pathname }: { projectSlug: string; pathname: string } =
    await req.json();

  if (!projectSlug || !pathname) {
    return NextResponse.json(
      { error: "Missing slug or pathname" },
      { status: 400 }
    );
  }

  try {
    const fileData = await fs.readFile(TRACKS_PATH, "utf-8");
    const tracks: TrackData[] = JSON.parse(fileData);

    const track = tracks.find((p) => p.slug === projectSlug);
    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const before = track.attachments?.length ?? 0;

    // Remove attachment from the track
    track.attachments = (track.attachments || []).filter(
      (f: Attachment) => f.pathname !== pathname
    );

    if ((track.attachments?.length ?? 0) === before) {
      // Attachment not found on this track; don't attempt deletion
      return NextResponse.json(
        { error: "Attachment not found on track" },
        { status: 404 }
      );
    }

    // Persist update first
    await fs.writeFile(TRACKS_PATH, JSON.stringify(tracks, null, 2));

    // Delete the blob (uploads use addRandomSuffix, so safe to delete directly)
    await del(pathname, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete attachment error:", err);
    return NextResponse.json(
      { error: "Failed to delete attachment" },
      { status: 500 }
    );
  }
}
