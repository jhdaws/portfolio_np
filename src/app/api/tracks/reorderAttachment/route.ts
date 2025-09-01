import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/utils/kvJson";
import type { TrackData } from "@/utils/trackData";

const KV_KEY = "data/tracks.json";

export async function POST(req: NextRequest) {
  const { projectSlug, fromIndex, toIndex } = await req.json();

  try {
    const tracks = await readJson<TrackData[]>(KV_KEY, []);

    const track = tracks.find((p) => p.slug === projectSlug);
    if (!track || !track.attachments) {
      return NextResponse.json(
        { error: "Track or attachments not found" },
        { status: 404 }
      );
    }

    const [moved] = track.attachments.splice(fromIndex, 1);
    track.attachments.splice(toIndex, 0, moved);

    await writeJson(KV_KEY, tracks);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reorder error:", err);
    return NextResponse.json(
      { error: "Failed to reorder attachment" },
      { status: 500 }
    );
  }
}
