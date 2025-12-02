import { readJson, writeJson } from "@/utils/kvJson";

const KV_KEY = "data/gallery.json";

export type GalleryItem = {
  slug: string;
  image: string;
  imagePathname?: string;
  description: string;
  location: string;
  date: string;
};

export async function getAllGalleryItems(): Promise<GalleryItem[]> {
  return readJson<GalleryItem[]>(KV_KEY, []);
}

export async function saveGalleryItems(items: GalleryItem[]) {
  await writeJson(KV_KEY, items);
}
