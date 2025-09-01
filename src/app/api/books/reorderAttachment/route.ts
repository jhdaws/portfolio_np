import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/utils/kvJson";
import type { BookData } from "@/utils/bookData";

const KV_KEY = "data/books.json";

export async function POST(req: NextRequest) {
  const { projectSlug, fromIndex, toIndex } = await req.json();

  try {
    const books = await readJson<BookData[]>(KV_KEY, []);

    const book = books.find((p) => p.slug === projectSlug);
    if (!book || !book.attachments) {
      return NextResponse.json(
        { error: "Book or attachments not found" },
        { status: 404 }
      );
    }

    const [moved] = book.attachments.splice(fromIndex, 1);
    book.attachments.splice(toIndex, 0, moved);

    await writeJson(KV_KEY, books);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reorder error:", err);
    return NextResponse.json(
      { error: "Failed to reorder attachment" },
      { status: 500 }
    );
  }
}
