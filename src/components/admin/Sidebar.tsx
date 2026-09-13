"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/_actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/posts", label: "Journal" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/clients", label: "Trusted Clients" },
  { href: "/admin/contact", label: "Contact" },
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="flex shrink-0 flex-col gap-8 border-b border-line bg-canvas p-6 md:h-dvh md:w-60 md:border-b-0 md:border-r">
      <div>
        <p className="label text-ink-muted">MTC</p>
        <p className="mt-1 text-sm font-semibold text-ink">Content</p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-sm px-2.5 py-1.5 text-sm transition-colors",
              isActive(item.href)
                ? "bg-blue-tint font-medium text-blue"
                : "text-ink-muted hover:bg-paper hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full rounded-sm border border-line px-2.5 py-1.5 text-left text-sm text-ink-muted transition-colors hover:border-ink/30 hover:text-ink"
        >
          Log out
        </button>
      </form>
    </aside>
  );
}
