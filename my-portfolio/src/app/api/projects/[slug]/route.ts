import { NextRequest, NextResponse } from "next/server";
import { getAllProjects, saveProjects } from "@/utils/projectData";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const projects = getAllProjects();
  const filtered = projects.filter((p) => p.slug !== params.slug);
  saveProjects(filtered);
  return NextResponse.json({ status: "deleted" });
}
