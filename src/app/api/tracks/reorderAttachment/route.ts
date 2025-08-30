import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import type { TrackData } from "@/utils/trackData";

const TRACKS_PATH = path.join(process.cwd(), "src", "data", "tracks.json");

export async function POST(req: NextRequest) {
  const { projectSlug, fromIndex, toIndex } = await req.json();

  try {
    const fileData = await fs.readFile(TRACKS_PATH, "utf-8");
    const tracks: TrackData[] = JSON.parse(fileData);

    const track = tracks.find((p) => p.slug === projectSlug);
    if (!track || !track.attachments) {
      return NextResponse.json(
        { error: "Track or attachments not found" },
        { status: 404 }
      );
    }

    const [moved] = track.attachments.splice(fromIndex, 1);
    track.attachments.splice(toIndex, 0, moved);

    await fs.writeFile(TRACKS_PATH, JSON.stringify(tracks, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reorder error:", err);
    return NextResponse.json(
      { error: "Failed to reorder attachment" },
      { status: 500 }
    );
  }
}
