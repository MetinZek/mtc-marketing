import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Logo } from "@/components/ui/Logo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { withLocale } from "@/i18n/paths";

/** 404: a short, friendly dead end with the two ways forward. */
export default async function NotFound() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-canvas px-6 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(11,69,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,69,255,0.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_10%,transparent_70%)]"
      />
      <div className="relative">
        <a href={withLocale("/", locale)} aria-label={dict.notFound.homeAriaLabel} className="mx-auto mb-12 block w-fit">
          <Logo height={24} />
        </a>
        <Label>{dict.notFound.errorLabel}</Label>
        <h1 className="text-display-2 mx-auto mt-5 max-w-[16ch] text-ink">{dict.notFound.title}</h1>
        <p className="mx-auto mt-5 max-w-sm text-lead text-ink-muted">{dict.notFound.body}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href={withLocale("/", locale)} arrow>
            {dict.notFound.backToHome}
          </Button>
          <Button href={withLocale("/work", locale)} variant="secondary">
            {dict.notFound.viewOurWork}
          </Button>
        </div>
      </div>
    </main>
  );
}
