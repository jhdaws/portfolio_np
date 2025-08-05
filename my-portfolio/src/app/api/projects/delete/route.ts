import { NextRequest, NextResponse } from "next/server";
import { getAllProjects, saveProjects } from "@/utils/projectData";

export async function POST(req: NextRequest) {
  const { slug } = await req.json();
  const projects = getAllProjects();
  const updated = projects.filter((p) => p.slug !== slug);
  saveProjects(updated);
  return NextResponse.json({ status: "deleted" });
}
