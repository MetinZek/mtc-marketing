import Link from "next/link";
import { counts } from "@/lib/cms/admin";

const TILES = [
  { key: "projects", label: "Projects", href: "/admin/projects" },
  { key: "services", label: "Services", href: "/admin/services" },
  { key: "team", label: "Team members", href: "/admin/team" },
  { key: "posts", label: "Journal articles", href: "/admin/posts" },
  { key: "testimonials", label: "Testimonials", href: "/admin/testimonials" },
  { key: "clients", label: "Trusted clients", href: "/admin/clients" },
  { key: "submissions", label: "Contact messages", href: "/admin/contact" },
] as const;

export default async function DashboardPage() {
  const c = await counts();

  return (
    <div>
      <p className="label text-ink-muted">Overview</p>
      <h1 className="text-display-3 mt-1 text-ink">Dashboard</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {TILES.map((tile) => (
          <Link
            key={tile.key}
            href={tile.href}
            className="rounded-md border border-line p-5 transition-colors hover:border-ink/25"
          >
            <p className="text-display-3 text-ink">{c[tile.key]}</p>
            <p className="mt-1 text-meta text-ink-muted">{tile.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
