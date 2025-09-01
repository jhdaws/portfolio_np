import { readJson, writeJson } from "@/utils/kvJson";
import type { Attachment } from "@/utils/projectData";

const KV_KEY = "data/tracks.json";

export type TrackData = {
  slug: string;
  title: string;
  artist: string;
  description: string;
  image?: string;
  imagePathname?: string;
  attachments?: Attachment[];
};

export async function getAllTracks(): Promise<TrackData[]> {
  return readJson<TrackData[]>(KV_KEY, []);
}

export async function saveTracks(tracks: TrackData[]) {
  await writeJson(KV_KEY, tracks);
}
