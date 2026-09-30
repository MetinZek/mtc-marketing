import "server-only";

import { workPageSchema } from "@/content/schema";
import type { WorkPage } from "@/content/types";
import { readRows } from "./store";

export const WORK_PAGE_ID = "work-page";

/** Admin → Work Page settings (defaults until first saved). Stored as a
 * single document in the "settings" store. */
export async function getWorkPage(): Promise<WorkPage> {
  const rows = (await readRows("settings")) as { id?: string }[];
  const row = rows.find((r) => r.id === WORK_PAGE_ID);
  const parsed = workPageSchema.safeParse(row ?? { id: WORK_PAGE_ID });
  return parsed.success ? parsed.data : workPageSchema.parse({ id: WORK_PAGE_ID });
}
