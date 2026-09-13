import Link from "next/link";
import { deleteEntryAction } from "@/app/admin/_actions";
import { Button } from "@/components/ui/Button";
import type { CollectionDef } from "@/lib/admin/collections";
import { isPublished, listEntries, type CmsCollection } from "@/lib/cms/admin";
import { ConfirmSubmit } from "./ConfirmSubmit";
import { PublishToggle } from "./PublishToggle";

function cell(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export async function CollectionTable({ def }: { def: CollectionDef }) {
  const entries = (await listEntries(def.key)) as ReadonlyArray<
    Record<string, unknown>
  >;

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-ink-muted">Collection</p>
          <h1 className="text-display-3 mt-1 text-ink">{def.plural}</h1>
        </div>
        {def.canCreate && (
          <Button href={`/admin/${def.key}/new`} size="sm">
            New {def.singular.toLowerCase()}
          </Button>
        )}
      </header>

      <div className="mt-8 overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-line bg-paper text-meta text-ink-muted">
            <tr>
              {def.listColumns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const id = String(entry.id);
              return (
                <tr key={id} className="border-b border-line last:border-b-0">
                  {def.listColumns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-ink">
                      {col.key === def.listColumns[0]?.key ? (
                        <Link
                          href={`/admin/${def.key}/${id}`}
                          className="font-medium hover:text-blue"
                        >
                          {cell(entry[col.key])}
                        </Link>
                      ) : (
                        cell(entry[col.key])
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <PublishToggle
                      collection={def.key}
                      id={id}
                      published={isPublished(
                        def.key,
                        entry as never,
                      )}
                      onLabel={def.publishLabel}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/${def.key}/${id}`}
                        className="text-meta text-ink-muted hover:text-blue"
                      >
                        Edit
                      </Link>
                      {def.canDelete && (
                        <form action={deleteEntryAction}>
                          <input
                            type="hidden"
                            name="collection"
                            value={def.key}
                          />
                          <input type="hidden" name="id" value={id} />
                          <ConfirmSubmit
                            message={`Delete this ${def.singular.toLowerCase()} permanently?`}
                            className="text-meta text-ink-muted hover:text-danger"
                          >
                            Delete
                          </ConfirmSubmit>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {entries.length === 0 && (
        <p className="mt-6 text-meta text-ink-muted">
          Nothing here yet.
        </p>
      )}
    </div>
  );
}

export function assertCollection(key: string): CmsCollection {
  return key as CmsCollection;
}
