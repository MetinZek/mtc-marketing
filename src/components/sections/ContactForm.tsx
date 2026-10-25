"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { submitContactAction } from "@/app/[locale]/(site)/contact/_action";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Dictionary } from "@/i18n/get-dictionary";
import { splitLocaleFromPathname } from "@/i18n/paths";
import { cn } from "@/lib/utils";

type FieldKey = "name" | "email" | "company" | "phone" | "message";

const EMPTY: Record<FieldKey, string> = {
  name: "",
  email: "",
  company: "",
  phone: "",
  message: "",
};

const FIELD_ORDER: FieldKey[] = ["name", "email", "company", "phone", "message"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+(]?\d[\d\s()+-]{5,}$/;
// Keep in sync with contactInputSchema in src/content/schema.ts.
const MESSAGE_MIN_LENGTH = 20;
const SERVICE_MAX_LENGTH = 120;

type Errors = Partial<Record<FieldKey, string>>;

function validate(values: Record<FieldKey, string>, cf: Dictionary["contactForm"]): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = cf.nameRequired;
  if (!values.email.trim()) errors.email = cf.emailRequired;
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = cf.emailInvalid;
  if (values.phone.trim() && !PHONE_RE.test(values.phone.trim())) errors.phone = cf.phoneInvalid;
  if (values.message.trim().length < MESSAGE_MIN_LENGTH) errors.message = cf.messageRequired;
  return errors;
}

const fieldClass = (invalid: boolean) =>
  cn(
    "mt-2 w-full rounded-sm border bg-canvas px-4 py-3.5 text-body text-ink",
    "transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
    "placeholder:text-ink-faint focus:border-blue focus:shadow-[0_0_0_4px_rgb(11_69_255/0.14)] focus:outline-none",
    invalid ? "border-danger" : "border-line-strong hover:border-ink-faint",
  );

/**
 * Contact form, built from the site's own tokens. "What do you need?" is a
 * row of discipline chips; a link can pre-select them through
 * `?services=…`, so the brief is already begun. Validates on submit (and re-checks a field on blur afterwards),
 * then swaps to a confirmation. Submits through the existing
 * submitContactAction Server Action, unchanged: the chosen disciplines
 * are sent as one readable `service` line.
 */
export function ContactForm({
  services,
  dict,
}: {
  services: { id: string; title: string }[];
  dict: Dictionary;
}) {
  const cf = dict.contactForm;
  const pathname = usePathname();
  const { locale } = splitLocaleFromPathname(pathname);
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Record<FieldKey, string>>(EMPTY);
  const [selected, setSelected] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  // Carry a pre-selection over (?services=branding,web-app).
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("services");
    if (!wanted) return;
    const ids = wanted.split(",").filter((id) => services.some((s) => s.id === id));
    // Reading the URL is only possible after mount; this runs once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ids.length) setSelected(ids);
  }, [services]);

  const idFor = (key: FieldKey) => `${uid}-${key}`;

  const setField = (key: FieldKey, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (attempted && errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleBlur = (key: FieldKey) => {
    if (!attempted) return;
    const next = validate(values, cf);
    setErrors((e) => ({ ...e, [key]: next[key] }));
  };

  const toggle = (id: string) =>
    setSelected((current) => (current.includes(id) ? current.filter((s) => s !== id) : [...current, id]));

  /** The chosen disciplines as one line; ids if the titles run too long. */
  const serviceLine = () => {
    const chosen = services.filter((s) => selected.includes(s.id));
    const titles = chosen.map((s) => s.title).join(", ");
    return titles.length <= SERVICE_MAX_LENGTH ? titles : chosen.map((s) => s.id).join(", ");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const next = validate(values, cf);
    setAttempted(true);

    if (Object.keys(next).length > 0) {
      setErrors(next);
      const firstInvalid = FIELD_ORDER.find((key) => next[key]);
      if (firstInvalid) formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setErrors({});
    setStatus("submitting");

    const result = await submitContactAction({
      name: values.name,
      email: values.email,
      company: values.company,
      phone: values.phone,
      service: serviceLine(),
      message: values.message,
      locale,
    });

    if (!result.ok) {
      setErrors((prev) => ({ ...prev, ...(result.errors ?? {}) }));
      setStatus("idle");
      return;
    }

    setStatus("success");
  };

  if (status === "success") {
    return (
      <div role="status" className="rounded-[22px] bg-canvas p-8 sm:p-12">
        <span className="flex size-12 items-center justify-center rounded-full bg-ink text-white">
          <Icon name="check" className="text-2xl" strokeWidth={2} />
        </span>
        <p className="mt-6 text-eyebrow text-ink-muted">{cf.successLabel}</p>
        <p className="text-display-3 mt-2 max-w-md text-ink">{cf.successMessage}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit}>
      <fieldset>
        <legend className="text-title text-ink">{cf.servicesLabel}</legend>
        <p className="mt-1 text-meta text-ink-muted">{cf.servicesHint}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {services.map((service) => {
            const on = selected.includes(service.id);
            return (
              <button
                key={service.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(service.id)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-pill border px-4 py-2 text-[0.9375rem] font-medium",
                  "transition-[background-color,border-color,color,transform] duration-[var(--duration-fast)] active:scale-[0.97]",
                  on ? "border-ink bg-ink text-white" : "border-line-strong bg-canvas text-ink hover:border-ink-faint",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-4.5 items-center justify-center rounded-full",
                    on ? "bg-white text-ink" : "border border-line-strong",
                  )}
                >
                  {on && <Icon name="check" className="text-[0.75rem]" strokeWidth={2.4} />}
                </span>
                {service.title}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
        <TextField
          id={idFor("name")}
          name="name"
          label={cf.nameLabel}
          autoComplete="name"
          required
          value={values.name}
          error={errors.name}
          optionalSuffix={cf.optionalSuffix}
          onChange={(v) => setField("name", v)}
          onBlur={() => handleBlur("name")}
        />
        <TextField
          id={idFor("email")}
          name="email"
          label={cf.emailLabel}
          type="email"
          autoComplete="email"
          required
          value={values.email}
          error={errors.email}
          optionalSuffix={cf.optionalSuffix}
          onChange={(v) => setField("email", v)}
          onBlur={() => handleBlur("email")}
        />
        <TextField
          id={idFor("company")}
          name="company"
          label={cf.companyLabel}
          autoComplete="organization"
          value={values.company}
          error={errors.company}
          optionalSuffix={cf.optionalSuffix}
          onChange={(v) => setField("company", v)}
          onBlur={() => handleBlur("company")}
        />
        <TextField
          id={idFor("phone")}
          name="phone"
          label={cf.phoneLabel}
          type="tel"
          autoComplete="tel"
          value={values.phone}
          error={errors.phone}
          optionalSuffix={cf.optionalSuffix}
          onChange={(v) => setField("phone", v)}
          onBlur={() => handleBlur("phone")}
        />

        <div className="sm:col-span-2">
          <label htmlFor={idFor("message")} className="block text-[0.9375rem] font-medium text-ink">
            {cf.messageLabel}
          </label>
          <textarea
            id={idFor("message")}
            name="message"
            rows={6}
            required
            value={values.message}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? `${idFor("message")}-error` : undefined}
            onChange={(e) => setField("message", e.target.value)}
            onBlur={() => handleBlur("message")}
            placeholder={cf.messagePlaceholder}
            className={cn(fieldClass(Boolean(errors.message)), "min-h-[180px] resize-y")}
          />
          {errors.message && (
            <p id={`${idFor("message")}-error`} role="alert" className="mt-1.5 text-meta text-danger">
              {errors.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" size="lg" arrow className="mt-8" disabled={status === "submitting"}>
        {status === "submitting" ? cf.sending : cf.send}
      </Button>
    </form>
  );
}

function TextField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  required = false,
  value,
  error,
  optionalSuffix,
  onChange,
  onBlur,
}: {
  id: string;
  name: FieldKey;
  label: string;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  required?: boolean;
  value: string;
  error?: string;
  optionalSuffix: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[0.9375rem] font-medium text-ink">
        {label}
        {!required && <span className="ml-1.5 font-normal text-ink-muted">{optionalSuffix}</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={fieldClass(Boolean(error))}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-meta text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
