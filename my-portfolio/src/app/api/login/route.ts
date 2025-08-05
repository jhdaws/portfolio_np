import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password === ADMIN_PASSWORD) {
    (await cookies()).set("auth", "true", { path: "/" });
    return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
  }
  return new Response("Unauthorized", { status: 401 });
}
