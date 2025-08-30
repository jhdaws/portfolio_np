import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import type { BookData } from "@/utils/bookData";

const BOOKS_PATH = path.join(process.cwd(), "src", "data", "books.json");

export async function POST(req: NextRequest) {
  const { projectSlug, fromIndex, toIndex } = await req.json();

  try {
    const fileData = await fs.readFile(BOOKS_PATH, "utf-8");
    const books: BookData[] = JSON.parse(fileData);

    const book = books.find((p) => p.slug === projectSlug);
    if (!book || !book.attachments) {
      return NextResponse.json(
        { error: "Book or attachments not found" },
        { status: 404 }
      );
    }

    const [moved] = book.attachments.splice(fromIndex, 1);
    book.attachments.splice(toIndex, 0, moved);

    await fs.writeFile(BOOKS_PATH, JSON.stringify(books, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reorder error:", err);
    return NextResponse.json(
      { error: "Failed to reorder attachment" },
      { status: 500 }
    );
  }
}
