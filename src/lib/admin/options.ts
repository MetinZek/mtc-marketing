import "server-only";

import { listEntries } from "@/lib/cms/admin";
import type { CollectionDef } from "./collections";

/**
 * Fills `select` fields whose options come from CMS content
 * (`optionsFrom`) — e.g. a gallery piece's Service — with the current
 * entries: the stored value is the entry id, the label its title.
 */
export async function withDynamicOptions(def: CollectionDef): Promise<CollectionDef> {
  if (!def.fields.some((field) => field.optionsFrom === "services")) return def;
  const services = await listEntries("services");
  return {
    ...def,
    fields: def.fields.map((field) =>
      field.optionsFrom === "services"
        ? {
            ...field,
            options: services.map((service) => service.id),
            optionLabels: Object.fromEntries(services.map((s) => [s.id, `${s.number} — ${s.title}`])),
          }
        : field,
    ),
  };
}
