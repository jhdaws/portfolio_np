import { NextRequest, NextResponse } from "next/server";
import {
  getAllBooks,
  saveBooks,
  type BookData,
} from "@/utils/bookData";

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
  const books = getAllBooks();
  return NextResponse.json(books);
}

export async function POST(req: NextRequest) {
  const { title, author, description, year, genre, imageUrl } =
    await req.json();
  if (!title || !author || !description) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const books = getAllBooks();
  const slug = createSlug(title, new Set(books.map((p) => p.slug)));

  const newBook: BookData = {
    title,
    author,
    description,
    year,
    genre,
    image: imageUrl,
    slug,
    attachments: [],
  };

  books.push(newBook);
  saveBooks(books);

  return NextResponse.json(newBook, { status: 201 });
}
