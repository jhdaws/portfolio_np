import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { del } from "@vercel/blob";
import type { BookData } from "@/utils/bookData";
import type { Attachment } from "@/utils/projectData";

export const runtime = "nodejs"; // ensure Node for fs

const BOOKS_PATH = path.join(process.cwd(), "src", "data", "books.json");

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

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;

    const raw = await fs.readFile(BOOKS_PATH, "utf-8");
    const books: BookData[] = JSON.parse(raw);

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
    await fs.writeFile(BOOKS_PATH, JSON.stringify(remaining, null, 2));

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
