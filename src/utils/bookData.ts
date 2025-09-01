import { readJson, writeJson } from "@/utils/kvJson";
import type { Attachment } from "@/utils/projectData";

const KV_KEY = "data/books.json";

export type BookData = {
  slug: string;
  title: string;
  author: string;
  description: string;
  year?: number;
  genre?: string;
  image?: string;
  imagePathname?: string;
  attachments?: Attachment[];
};

export async function getAllBooks(): Promise<BookData[]> {
  return readJson<BookData[]>(KV_KEY, []);
}

export async function saveBooks(books: BookData[]) {
  await writeJson(KV_KEY, books);
}
