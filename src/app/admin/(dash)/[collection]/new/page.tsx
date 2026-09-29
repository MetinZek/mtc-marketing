import { notFound } from "next/navigation";
import { EntryForm } from "@/components/admin/EntryForm";
import { getCollectionDef } from "@/lib/admin/collections";
import { withDynamicOptions } from "@/lib/admin/options";

export default async function NewEntryPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  const def = getCollectionDef(collection);
  if (!def || !def.canCreate) notFound();

  const defaults: Record<string, unknown> = {
    published: false,
    featured: false,
    order: 0,
    status: "draft",
    ctaLabel: "Explore service",
    publishedAt: new Date().toISOString().slice(0, 10),
  };

  return <EntryForm def={await withDynamicOptions(def)} entry={defaults} mode="create" />;
}
