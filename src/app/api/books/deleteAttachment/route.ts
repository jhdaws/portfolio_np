import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/utils/kvJson";
import { del } from "@vercel/blob";
import type { Attachment } from "@/utils/projectData";
import type { BookData } from "@/utils/bookData";

export const runtime = "nodejs";
const KV_KEY = "data/books.json";

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
    const books = await readJson<BookData[]>(KV_KEY, []);

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
    await writeJson(KV_KEY, books);

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
