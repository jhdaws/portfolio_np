import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("auth");
  return new Response(JSON.stringify({ status: "logged out" }), {
    status: 200,
  });
}
