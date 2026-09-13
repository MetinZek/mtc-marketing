"use client";

import { useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { submitContactAction } from "@/app/[locale]/(site)/contact/_action";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import type { Dictionary } from "@/i18n/get-dictionary";
import { splitLocaleFromPathname } from "@/i18n/paths";
import { cn } from "@/lib/utils";

type FieldKey = "name" | "email" | "company" | "phone" | "service" | "message";

const EMPTY: Record<FieldKey, string> = {
  name: "",
  email: "",
  company: "",
  phone: "",
  service: "",
  message: "",
};

const FIELD_ORDER: FieldKey[] = [
  "name",
  "email",
  "company",
  "phone",
  "service",
  "message",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+(]?\d[\d\s()+-]{5,}$/;
// Keep in sync with contactInputSchema's `message` min length in src/content/schema.ts.
const MESSAGE_MIN_LENGTH = 20;

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
    "mt-2 w-full border-b bg-transparent py-2.5 text-body text-ink",
    "transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
    "placeholder:text-ink-faint focus:border-blue",
    invalid ? "border-danger" : "border-line-strong",
  );

/**
 * Contact form built from the MTC tokens — underline fields, no boxes,
 * the shared <Button> to submit. Validates on submit (and re-checks a
 * field on blur once submitted), then swaps to a minimal confirmation.
 * Submits via the submitContactAction Server Action (stores the
 * submission + emails the studio inbox); `locale` is derived from the
 * current URL and sent along since Server Actions can't read
 * next/root-params themselves.
 */
export function ContactForm({
  serviceOptions,
  dict,
}: {
  serviceOptions: string[];
  dict: Dictionary;
}) {
  const cf = dict.contactForm;
  const pathname = usePathname();
  const { locale } = splitLocaleFromPathname(pathname);
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Record<FieldKey, string>>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );

  const idFor = (key: FieldKey) => `${uid}-${key}`;

  const setField = (key: FieldKey, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (attempted && errors[key]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const handleBlur = (key: FieldKey) => {
    if (!attempted) return;
    const next = validate(values, cf);
    setErrors((e) => ({ ...e, [key]: next[key] }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Belt-and-suspenders against a double submit: the button is already
    // disabled while submitting, but that `disabled` prop only lands on
    // the next render, so a fast double-click/double-Enter could still
    // reach here before it does.
    if (status === "submitting") return;

    const next = validate(values, cf);
    setAttempted(true);

    if (Object.keys(next).length > 0) {
      setErrors(next);
      const firstInvalid = FIELD_ORDER.find((key) => next[key]);
      if (firstInvalid) {
        formRef.current
          ?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)
          ?.focus();
      }
      return;
    }

    setErrors({});
    setStatus("submitting");

    const result = await submitContactAction({
      name: values.name,
      email: values.email,
      company: values.company,
      phone: values.phone,
      service: values.service,
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
      <Reveal>
        <div className="border-t border-line pt-8">
          <Label tone="blue">{cf.successLabel}</Label>
          <p className="text-display-3 mt-4 max-w-md text-ink">{cf.successMessage}</p>
        </div>
      </Reveal>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
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
          <label
            htmlFor={idFor("service")}
            className="label block text-ink-muted"
          >
            {cf.serviceLabel}
            <span className="ml-1.5 text-[0.72rem] font-normal normal-case tracking-normal text-ink-faint">
              {cf.optionalSuffix}
            </span>
          </label>
          <div className="relative">
            <select
              id={idFor("service")}
              name="service"
              value={values.service}
              onChange={(e) => setField("service", e.target.value)}
              className={cn(
                fieldClass(false),
                "appearance-none pr-8",
                values.service ? "text-ink" : "text-ink-faint",
              )}
            >
              <option value="">{cf.selectServicePlaceholder}</option>
              {serviceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-1 top-[1.35rem] text-ink-faint"
            >
              &#9662;
            </span>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor={idFor("message")}
            className="label block text-ink-muted"
          >
            {cf.messageLabel}
          </label>
          <textarea
            id={idFor("message")}
            name="message"
            rows={5}
            required
            value={values.message}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={
              errors.message ? `${idFor("message")}-error` : undefined
            }
            onChange={(e) => setField("message", e.target.value)}
            onBlur={() => handleBlur("message")}
            placeholder={cf.messagePlaceholder}
            className={cn(fieldClass(Boolean(errors.message)), "min-h-[200px] resize-y")}
          />
          {errors.message && (
            <p
              id={`${idFor("message")}-error`}
              role="alert"
              className="mt-1.5 text-meta text-danger"
            >
              {errors.message}
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="mt-10"
        disabled={status === "submitting"}
      >
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
      <label htmlFor={id} className="label block text-ink-muted">
        {label}
        {!required && (
          <span className="ml-1.5 text-[0.72rem] font-normal normal-case tracking-normal text-ink-faint">
            {optionalSuffix}
          </span>
        )}
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
