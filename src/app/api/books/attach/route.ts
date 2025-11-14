import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { readJson, writeJson } from "@/utils/kvJson";
import type { Attachment } from "@/utils/projectData";
import type { BookData } from "@/utils/bookData";

const KV_KEY = "data/books.json";

export async function POST(req: NextRequest) {
  const { projectSlug, file }: { projectSlug: string; file: Attachment } =
    await req.json();

  try {
    const books = await readJson<BookData[]>(KV_KEY, []);

    const book = books.find((p) => p.slug === projectSlug);
    if (!book)
      return NextResponse.json({ error: "Book not found" }, { status: 404 });

    if (!book.attachments) book.attachments = [];

    const attachment: Attachment = {
      ...file,
      id: file.id ?? randomUUID(),
      type: file.type ?? (file.body ? "note" : "file"),
    };

    book.attachments.push(attachment);

    await writeJson(KV_KEY, books);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Attach error:", err);
    return NextResponse.json(
      { error: "Failed to attach file" },
      { status: 500 }
    );
  }
}
