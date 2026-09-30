import { WorkPageEditor, type EditorItem } from "@/components/admin/WorkPageEditor";
import { en } from "@/i18n/dictionaries/en";
import { listEntries } from "@/lib/cms/admin";
import { getWorkPage } from "@/lib/cms/work-page";
import { coverImage } from "@/lib/project-cover";
import { layoutKey, resolveLayout } from "@/lib/work-layout";

/**
 * Admin → Work Page: the /work heading, default view and grid
 * arrangement (order, big/small, hidden) for every project and Work
 * gallery piece — drafts included, so their place is ready when they
 * are published.
 */
export default async function WorkPageAdmin() {
  const [settings, projects, pieces, services] = await Promise.all([
    getWorkPage(),
    listEntries("projects"),
    listEntries("gallery"),
    listEntries("services"),
  ]);
  const serviceTitle = new Map(services.map((s) => [s.id, s.title]));

  const items: Record<string, EditorItem> = {};
  for (const project of projects) {
    items[layoutKey("project", project.id)] = {
      kind: "project",
      id: project.id,
      title: project.title,
      subtitle: [project.category, project.year].join(" · "),
      thumb: coverImage(project).src,
      published: project.published,
      onHomepage: project.featured,
      editHref: `/admin/projects/${project.id}`,
    };
  }
  for (const piece of pieces) {
    items[layoutKey("piece", piece.id)] = {
      kind: "piece",
      id: piece.id,
      title: piece.title,
      subtitle: [piece.client, serviceTitle.get(piece.serviceId)].filter(Boolean).join(" · "),
      thumb: piece.image.src,
      published: piece.published,
      editHref: `/admin/gallery/${piece.id}`,
    };
  }

  return (
    <WorkPageEditor
      settings={settings}
      layout={resolveLayout(settings.layout, projects, pieces)}
      items={items}
      defaults={{ eyebrow: en.work.eyebrow, title: en.work.title }}
    />
  );
}
