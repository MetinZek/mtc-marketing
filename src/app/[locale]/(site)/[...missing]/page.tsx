import { notFound } from "next/navigation";

/**
 * Any public URL that matches no page (e.g. the old /services link) lands
 * here and is handed to the localized 404 in src/app/[locale]/not-found.tsx,
 * instead of Next's bare default page. Specific routes always win over
 * this catch-all; /admin, /api and static files never reach it (see
 * src/proxy.ts). The response keeps its 404 status.
 */
export default function MissingPage() {
  notFound();
}
