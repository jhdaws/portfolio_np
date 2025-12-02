import { NextRequest, NextResponse } from "next/server";
import {
  getAllGalleryItems,
  saveGalleryItems,
  type GalleryItem,
} from "@/utils/galleryData";

export const dynamic = "force-dynamic";

function createSlug(baseText: string, existing: Set<string>) {
  const base = baseText
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  let candidate = base || "entry";
  let i = 1;
  while (existing.has(candidate)) {
    candidate = `${base || "entry"}-${i++}`;
  }
  return candidate;
}

export async function GET() {
  const items = await getAllGalleryItems();
  return NextResponse.json(items, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  const { location, date, description, imageUrl, imagePath } =
    await req.json();

  if (!location || !date || !description || !imageUrl) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  const items = await getAllGalleryItems();
  const slug = createSlug(`${location}-${date}`, new Set(items.map((i) => i.slug)));

  const newItem: GalleryItem = {
    slug,
    location,
    date,
    description,
    image: imageUrl,
    imagePathname: imagePath,
  };

  items.push(newItem);
  await saveGalleryItems(items);

  return NextResponse.json(newItem, { status: 201 });
}
