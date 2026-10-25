import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { withLocale } from "@/i18n/paths";

/** 404: a short, calm dead end with the two ways forward. */
export default async function NotFound() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <main className="flex min-h-dvh flex-col bg-canvas px-4 sm:px-6">
      <a href={withLocale("/", locale)} aria-label={dict.notFound.homeAriaLabel} className="mx-auto mt-8 block w-fit rounded-xs">
        <Logo height={20} />
      </a>
      <div className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="text-eyebrow text-ink-muted">{dict.notFound.errorLabel}</p>
        <h1 className="text-display-1 mt-4 text-ink">{dict.notFound.title}</h1>
        <p className="mt-6 max-w-md text-lead text-ink-muted">{dict.notFound.body}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href={withLocale("/", locale)} size="lg">
            {dict.notFound.backToHome}
          </Button>
          <Button href={withLocale("/work", locale)} size="lg" variant="secondary">
            {dict.notFound.viewOurWork}
          </Button>
        </div>
      </div>
    </main>
  );
}
