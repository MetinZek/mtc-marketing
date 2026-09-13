import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

/**
 * Admin's own 404 — needed now that admin has its own independent root
 * layout (src/app/admin/layout.tsx) instead of sharing one with the
 * public site. English-only, same content as before the locale split.
 */
export default function AdminNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <Label>Error 404</Label>
      <h1 className="mt-5 text-display-2">Page not found</h1>
      <p className="mt-4 max-w-sm text-ink-muted">
        The page you were looking for doesn&rsquo;t exist or has moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Button href="/">Back to home</Button>
        <Button href="/work" variant="secondary">
          View our work
        </Button>
      </div>
      <Link href="/" className="sr-only">
        MTC home
      </Link>
    </div>
  );
}
