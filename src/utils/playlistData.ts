import { readJson, writeJson } from "@/utils/kvJson";

const KV_KEY = "data/playlists.json";

export type PlaylistData = {
  slug: string;
  title: string;
  description: string;
  url: string;
  image?: string;
  imagePathname?: string;
};

export async function getAllPlaylists(): Promise<PlaylistData[]> {
  return readJson<PlaylistData[]>(KV_KEY, []);
}

export async function savePlaylists(playlists: PlaylistData[]) {
  await writeJson(KV_KEY, playlists);
}
