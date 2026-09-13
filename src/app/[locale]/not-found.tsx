import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { withLocale } from "@/i18n/paths";

export default async function NotFound() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <Label>{dict.notFound.errorLabel}</Label>
      <h1 className="mt-5 text-display-2">{dict.notFound.title}</h1>
      <p className="mt-4 max-w-sm text-ink-muted">{dict.notFound.body}</p>
      <div className="mt-8 flex gap-3">
        <Button href={withLocale("/", locale)}>{dict.notFound.backToHome}</Button>
        <Button href={withLocale("/work", locale)} variant="secondary">
          {dict.notFound.viewOurWork}
        </Button>
      </div>
      <Link href={withLocale("/", locale)} className="sr-only">
        {dict.notFound.homeAriaLabel}
      </Link>
    </div>
  );
}
