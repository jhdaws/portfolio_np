import fs from "fs";
import path from "path";
import type { Attachment } from "@/utils/projectData";

const dataFilePath = path.join(process.cwd(), "src/data/tracks.json");

export type TrackData = {
  slug: string;
  title: string;
  artist: string;
  description: string;
  image?: string;
  imagePathname?: string;
  attachments?: Attachment[];
};

export function getAllTracks(): TrackData[] {
  try {
    const fileContents = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(fileContents) as TrackData[];
  } catch (err) {
    console.error("Failed to read tracks.json:", err);
    return [];
  }
}

export function saveTracks(tracks: TrackData[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(tracks, null, 2), "utf-8");
}
