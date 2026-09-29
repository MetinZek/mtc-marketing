import { notFound } from "next/navigation";
import { CollectionTable } from "@/components/admin/CollectionTable";
import { getCollectionDef } from "@/lib/admin/collections";

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ archived?: string }>;
}) {
  const { collection } = await params;
  const def = getCollectionDef(collection);
  if (!def) notFound();

  const { archived } = await searchParams;
  return <CollectionTable def={def} archived={archived === "1"} />;
}
