import { readJson, writeJson } from "@/utils/kvJson";

const KV_KEY = "data/projects.json";

export type Attachment = {
  id?: string;
  type?: "file" | "note";
  name: string;
  url?: string;
  contentType?: string;
  pathname?: string;
  body?: string;
};

export type ProjectData = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  imagePathname?: string;
  attachments?: Attachment[];
};

export async function getAllProjects(): Promise<ProjectData[]> {
  return readJson<ProjectData[]>(KV_KEY, []);
}

export async function saveProjects(projects: ProjectData[]) {
  await writeJson(KV_KEY, projects);
}
