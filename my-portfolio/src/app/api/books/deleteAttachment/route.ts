import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { del } from "@vercel/blob";
import type { Attachment } from "@/utils/projectData";
import type { BookData } from "@/utils/bookData";

const BOOKS_PATH = path.join(process.cwd(), "src", "data", "books.json");

export async function POST(req: NextRequest) {
  const { projectSlug, pathname }: { projectSlug: string; pathname: string } =
    await req.json();

  if (!projectSlug || !pathname) {
    return NextResponse.json(
      { error: "Missing slug or pathname" },
      { status: 400 }
    );
  }

  try {
    const fileData = await fs.readFile(BOOKS_PATH, "utf-8");
    const books: BookData[] = JSON.parse(fileData);

    const book = books.find((p) => p.slug === projectSlug);
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const before = book.attachments?.length ?? 0;

    // Remove attachment from the book
    book.attachments = (book.attachments || []).filter(
      (f: Attachment) => f.pathname !== pathname
    );

    if ((book.attachments?.length ?? 0) === before) {
      // Attachment not found on this book; don't attempt deletion
      return NextResponse.json(
        { error: "Attachment not found on book" },
        { status: 404 }
      );
    }

    // Persist update first
    await fs.writeFile(BOOKS_PATH, JSON.stringify(books, null, 2));

    // Delete the blob (uploads use addRandomSuffix, so safe to delete directly)
    await del(pathname, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete attachment error:", err);
    return NextResponse.json(
      { error: "Failed to delete attachment" },
      { status: 500 }
    );
  }
}
