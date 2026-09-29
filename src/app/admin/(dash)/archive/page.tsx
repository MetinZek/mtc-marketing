import { deleteArchivedAction, restoreArchivedAction } from "@/app/admin/_actions";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { COLLECTION_DEFS } from "@/lib/admin/collections";
import { ARCHIVE_RETENTION_DAYS, listArchive } from "@/lib/cms/admin";

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Whole days left before an entry archived at `iso` is purged. */
function daysLeft(iso: string): number {
  const left = Date.parse(iso) + ARCHIVE_RETENTION_DAYS * DAY_MS - Date.now();
  return Math.max(0, Math.ceil(left / DAY_MS));
}

/**
 * Deleted entries from every collection. Each can be restored exactly as
 * it was (published state, order, images) for ARCHIVE_RETENTION_DAYS
 * days, after which it is deleted permanently.
 */
export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ restored?: string; error?: string }>;
}) {
  const [entries, { restored, error }] = await Promise.all([listArchive(), searchParams]);

  return (
    <div>
      <header>
        <p className="label text-ink-muted">Deleted items</p>
        <h1 className="text-display-3 mt-1 text-ink">Archive</h1>
        <p className="mt-3 max-w-xl text-meta text-ink-muted">
          Everything deleted in the admin lands here. Restore puts it back exactly as it
          was. After {ARCHIVE_RETENTION_DAYS} days it is deleted permanently.
        </p>
      </header>

      {restored && (
        <p
          role="status"
          className="mt-6 rounded-sm border border-line bg-paper px-3 py-2 text-meta text-ink-muted"
        >
          Restored “{restored}”. Check its Published setting if it should be live.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-6 rounded-sm border border-danger/40 bg-danger/5 px-3 py-2 text-meta text-danger"
        >
          {error}
        </p>
      )}

      <div className="mt-8 overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-line bg-paper text-meta text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Deleted</th>
              <th className="px-4 py-3 font-medium">Permanently deleted in</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const left = daysLeft(entry.archivedAt);
              return (
                <tr key={entry.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 font-medium text-ink">{entry.title}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {COLLECTION_DEFS[entry.collection]?.singular ?? entry.collection}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(entry.archivedAt)}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {left <= 1 ? "Less than a day" : `${left} days`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <form action={restoreArchivedAction}>
                        <input type="hidden" name="id" value={entry.id} />
                        <button type="submit" className="text-meta text-blue hover:underline">
                          Restore
                        </button>
                      </form>
                      <form action={deleteArchivedAction}>
                        <input type="hidden" name="id" value={entry.id} />
                        <ConfirmSubmit
                          message={`Permanently delete “${entry.title}”? This can't be undone.`}
                          className="text-meta text-ink-muted hover:text-danger"
                        >
                          Delete forever
                        </ConfirmSubmit>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {entries.length === 0 && (
        <p className="mt-6 text-meta text-ink-muted">The archive is empty.</p>
      )}
    </div>
  );
}
