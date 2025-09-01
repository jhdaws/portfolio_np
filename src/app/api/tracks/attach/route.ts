import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/utils/kvJson";
import type { Attachment } from "@/utils/projectData";
import type { TrackData } from "@/utils/trackData";

const KV_KEY = "data/tracks.json";

export async function POST(req: NextRequest) {
  const { projectSlug, file }: { projectSlug: string; file: Attachment } =
    await req.json();

  try {
    const tracks = await readJson<TrackData[]>(KV_KEY, []);

    const track = tracks.find((p) => p.slug === projectSlug);
    if (!track)
      return NextResponse.json({ error: "Track not found" }, { status: 404 });

    if (!track.attachments) track.attachments = [];
    track.attachments.push(file);

    await writeJson(KV_KEY, tracks);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Attach error:", err);
    return NextResponse.json(
      { error: "Failed to attach file" },
      { status: 500 }
    );
  }
}
