import { notFound } from "next/navigation";
import { EntryForm } from "@/components/admin/EntryForm";
import { getCollectionDef } from "@/lib/admin/collections";
import { withDynamicOptions } from "@/lib/admin/options";
import { getEntry } from "@/lib/cms/admin";

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  const { collection, id } = await params;
  const def = getCollectionDef(collection);
  if (!def) notFound();

  const entry = await getEntry(def.key, id);
  if (!entry) notFound();

  return (
    <EntryForm
      def={await withDynamicOptions(def)}
      entry={entry as Record<string, unknown>}
      mode="edit"
    />
  );
}
