import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/utils/kvJson";
import { del } from "@vercel/blob";
import type { BookData } from "@/utils/bookData";
import type { Attachment } from "@/utils/projectData";

export const runtime = "nodejs";
const KV_KEY = "data/books.json";

// Detect if a URL points to Vercel Blob; expand this list if you use a custom domain
function isVercelBlobUrl(u: string) {
  try {
    const { hostname } = new URL(u);
    return (
      hostname.endsWith(".public.blob.vercel-storage.com") ||
      hostname.endsWith(".blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

// Prefer pathname; else if we only have a Blob URL, return the URL (del supports URL strings)
function getDeleteTargetForImage(image?: string, imagePathname?: string) {
  if (imagePathname) return imagePathname; // e.g. "/bucket/key-random"
  if (image && isVercelBlobUrl(image)) return image; // full URL fallback
  return undefined;
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const { title, author, description, year, genre } = await req.json();
  const books = await readJson<BookData[]>(KV_KEY, []);
  const book = books.find((b) => b.slug === slug);
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  if (title !== undefined) book.title = title;
  if (author !== undefined) book.author = author;
  if (description !== undefined) book.description = description;
  if (year !== undefined) book.year = year;
  if (genre !== undefined) book.genre = genre;
  await writeJson(KV_KEY, books);
  return NextResponse.json(book);
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;

    const books = await readJson<BookData[]>(KV_KEY, []);

    const idx = books.findIndex((p) => p.slug === slug);
    if (idx === -1) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const book = books[idx];
    const attachments: Attachment[] = book.attachments || [];

    // Collect attachment delete targets (prefer pathname; fall back to URL if needed)
    const attachmentTargets = attachments
      .map((a) => a.pathname || a.url)
      .filter(Boolean) as string[];

    // Add cover image delete target if applicable
    const imageTarget = getDeleteTargetForImage(
      book.image,
      book.imagePathname
    );
    const deleteTargets = imageTarget
      ? [imageTarget, ...attachmentTargets]
      : attachmentTargets;

    // Best-effort delete all blobs in parallel
    const results = await Promise.allSettled(
      deleteTargets.map((t) =>
        del(t, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })
      )
    );

    // Remove the book and persist
    const remaining = books.filter((_, i) => i !== idx);
    await writeJson(KV_KEY, remaining);

    const failed = results
      .map((r, i) => ({ r, target: deleteTargets[i] }))
      .filter((x) => x.r.status === "rejected")
      .map((x) => ({
        target: x.target,
        error: String((x.r as PromiseRejectedResult).reason),
      }));

    return NextResponse.json({
      ok: true,
      deletedBook: book.slug,
      blobsAttempted: deleteTargets.length,
      blobsDeleted: deleteTargets.length - failed.length,
      blobsFailed: failed,
    });
  } catch (err) {
    console.error("Delete book error:", err);
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    );
  }
}
