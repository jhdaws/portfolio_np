import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import type { Attachment } from "@/utils/projectData";
import type { TrackData } from "@/utils/trackData";

const TRACKS_PATH = path.join(process.cwd(), "src", "data", "tracks.json");

export async function POST(req: NextRequest) {
  const { projectSlug, file }: { projectSlug: string; file: Attachment } =
    await req.json();

  try {
    const fileData = await fs.readFile(TRACKS_PATH, "utf-8");
    const tracks: TrackData[] = JSON.parse(fileData);

    const track = tracks.find((p) => p.slug === projectSlug);
    if (!track)
      return NextResponse.json({ error: "Track not found" }, { status: 404 });

    if (!track.attachments) track.attachments = [];
    track.attachments.push(file);

    await fs.writeFile(TRACKS_PATH, JSON.stringify(tracks, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Attach error:", err);
    return NextResponse.json(
      { error: "Failed to attach file" },
      { status: 500 }
    );
  }
}
