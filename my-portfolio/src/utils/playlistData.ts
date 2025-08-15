import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src/data/playlists.json");

export type PlaylistData = {
  slug: string;
  title: string;
  description: string;
  url: string;
  image?: string;
  imagePathname?: string;
};

export function getAllPlaylists(): PlaylistData[] {
  try {
    const fileContents = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(fileContents) as PlaylistData[];
  } catch (err) {
    console.error("Failed to read playlists.json:", err);
    return [];
  }
}

export function savePlaylists(playlists: PlaylistData[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(playlists, null, 2), "utf-8");
}
