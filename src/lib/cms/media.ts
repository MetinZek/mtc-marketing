import "server-only";

import { dbRead, dbWrite } from "@/lib/db/client";

/**
 * Admin-uploaded images stored in Postgres (`cms_media`) and served by
 * /api/media/[name] — so uploads persist on Vercel, whose deployment
 * filesystem is read-only/ephemeral. Names are server-generated
 * (`<timestamp>-<uuid>.<ext>`), so rows are write-once and immutable.
 */

export const MEDIA_ROUTE = "/api/media";

export async function saveMedia(
  name: string,
  contentType: string,
  bytes: Buffer,
): Promise<string> {
  await dbWrite(
    (sql) => sql`
      insert into cms_media (name, content_type, size, data)
      values (${name}, ${contentType}, ${bytes.length}, ${bytes})
    `,
  );
  return `${MEDIA_ROUTE}/${name}`;
}

export async function getMedia(
  name: string,
): Promise<{ contentType: string; data: Buffer } | null> {
  const rows = await dbRead(
    (sql) => sql`select content_type, data from cms_media where name = ${name}`,
  );
  const row = rows[0];
  return row
    ? { contentType: String(row.content_type), data: row.data as Buffer }
    : null;
}
