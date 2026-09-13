import { updateSubmissionStatusAction } from "@/app/admin/_actions";
import { submissionStatuses } from "@/content/schema";
import { listSubmissions } from "@/lib/cms/admin";
import { cn } from "@/lib/utils";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export async function SubmissionsTable() {
  const submissions = await listSubmissions();

  return (
    <div>
      <header>
        <p className="label text-ink-muted">Inbox</p>
        <h1 className="text-display-3 mt-1 text-ink">Contact</h1>
        <p className="mt-2 text-meta text-ink-muted">
          {submissions.length}{" "}
          {submissions.length === 1 ? "message" : "messages"} — not shown on the
          public site.
        </p>
      </header>

      <div className="mt-8 space-y-4">
        {submissions.map((s) => (
          <article
            key={s.id}
            className="rounded-md border border-line p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {s.name}
                  {s.company ? (
                    <span className="font-normal text-ink-muted">
                      {" "}
                      · {s.company}
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-meta text-ink-muted">
                  <a href={`mailto:${s.email}`} className="hover:text-blue">
                    {s.email}
                  </a>
                  {s.phone ? <> · {s.phone}</> : null}
                  {s.service ? <> · {s.service}</> : null}
                </p>
              </div>

              <form
                action={updateSubmissionStatusAction}
                className="flex items-center gap-2"
              >
                <input type="hidden" name="id" value={s.id} />
                <select
                  name="status"
                  defaultValue={s.status}
                  className="rounded-sm border border-line bg-canvas px-2 py-1 text-[0.8125rem] text-ink outline-none focus:border-blue"
                >
                  {submissionStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className={cn(
                    "rounded-sm border border-line px-2 py-1 text-[0.8125rem]",
                    "text-ink-muted transition-colors hover:border-ink/30 hover:text-ink",
                  )}
                >
                  Update
                </button>
              </form>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm text-ink">
              {s.message}
            </p>

            <p className="mt-4 text-meta text-ink-faint">
              {formatDate(s.submittedAt)}
            </p>
          </article>
        ))}

        {submissions.length === 0 && (
          <p className="text-meta text-ink-muted">No messages yet.</p>
        )}
      </div>
    </div>
  );
}
