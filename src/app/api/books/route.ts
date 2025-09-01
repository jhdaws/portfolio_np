import { NextRequest, NextResponse } from "next/server";
import {
  getAllBooks,
  saveBooks,
  type BookData,
} from "@/utils/bookData";
export const dynamic = "force-dynamic";
// JSON storage now uses Vercel KV; uploads still use Blob

function createSlug(title: string, existing: Set<string>): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  let slug = base;
  let i = 1;
  while (existing.has(slug)) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function GET() {
  const books = await getAllBooks();
  return NextResponse.json(books, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const { title, author, description, year, genre, imageUrl, imagePath } =
    await req.json();
  if (!title || !author || !description) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const books = await getAllBooks();
  const slug = createSlug(title, new Set(books.map((p) => p.slug)));

  const newBook: BookData = {
    title,
    author,
    description,
    year,
    genre,
    image: imageUrl,
    imagePathname: imagePath,
    slug,
    attachments: [],
  };

  books.push(newBook);
  await saveBooks(books);

  return NextResponse.json(newBook, { status: 201 });
}
