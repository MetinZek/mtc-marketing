import { notFound } from "next/navigation";
import { CollectionTable } from "@/components/admin/CollectionTable";
import { getCollectionDef } from "@/lib/admin/collections";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  const def = getCollectionDef(collection);
  if (!def) notFound();

  return <CollectionTable def={def} />;
}
