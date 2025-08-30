import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import type { Attachment } from "@/utils/projectData";
import type { BookData } from "@/utils/bookData";

const BOOKS_PATH = path.join(process.cwd(), "src", "data", "books.json");

export async function POST(req: NextRequest) {
  const { projectSlug, file }: { projectSlug: string; file: Attachment } =
    await req.json();

  try {
    const fileData = await fs.readFile(BOOKS_PATH, "utf-8");
    const books: BookData[] = JSON.parse(fileData);

    const book = books.find((p) => p.slug === projectSlug);
    if (!book)
      return NextResponse.json({ error: "Book not found" }, { status: 404 });

    if (!book.attachments) book.attachments = [];
    book.attachments.push(file);

    await fs.writeFile(BOOKS_PATH, JSON.stringify(books, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Attach error:", err);
    return NextResponse.json(
      { error: "Failed to attach file" },
      { status: 500 }
    );
  }
}
