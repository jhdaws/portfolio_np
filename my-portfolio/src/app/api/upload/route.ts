import { put } from "@vercel/blob";
import { NextRequest } from "next/server";
import { isAdmin } from "@/utils/auth";

export async function POST(req: NextRequest) {
  // Temporary server-side admin check
  const admin = isAdmin(); // You may eventually move this to a real auth layer

  if (!admin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File;

  const blob = await put(file.name, file, {
    access: "public",
  });

  return Response.json(blob);
}
