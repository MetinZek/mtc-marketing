import { togglePublishedAction } from "@/app/admin/_actions";
import { cn } from "@/lib/utils";

/** One-click publish/unpublish, posted as a server action. */
export function PublishToggle({
  collection,
  id,
  published,
  onLabel,
}: {
  collection: string;
  id: string;
  published: boolean;
  onLabel: string;
}) {
  return (
    <form action={togglePublishedAction} className="inline-block">
      <input type="hidden" name="collection" value={collection} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="next" value={published ? "false" : "true"} />
      <button
        type="submit"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.72rem] font-medium transition-colors",
          published
            ? "border-blue/30 bg-blue-tint text-blue"
            : "border-line text-ink-muted hover:border-ink/30",
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            published ? "bg-blue" : "bg-ink-faint",
          )}
        />
        {published ? onLabel : "Hidden"}
      </button>
    </form>
  );
}
