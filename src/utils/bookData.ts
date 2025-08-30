import fs from "fs";
import path from "path";
import type { Attachment } from "@/utils/projectData";

const dataFilePath = path.join(process.cwd(), "src/data/books.json");

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

export function getAllBooks(): BookData[] {
  try {
    const fileContents = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(fileContents) as BookData[];
  } catch (err) {
    console.error("Failed to read books.json:", err);
    return [];
  }
}

export function saveBooks(books: BookData[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(books, null, 2), "utf-8");
}
