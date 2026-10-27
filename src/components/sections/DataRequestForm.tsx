"use client";

import { useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { submitDataRequestAction } from "@/app/[locale]/(site)/legal/data-request/_action";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Dictionary } from "@/i18n/get-dictionary";
import { splitLocaleFromPathname } from "@/i18n/paths";
import { cn } from "@/lib/utils";
import { fieldClass } from "./ContactForm";

const TYPES = ["access", "correct", "delete", "object"] as const;
type RequestType = (typeof TYPES)[number];
type Field = "type" | "name" | "email" | "details";
type Errors = Partial<Record<Field, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELD_ORDER: Field[] = ["type", "name", "email", "details"];

/**
 * The "Your data" form: what to do (a copy, a correction, deletion, or
 * no further use), then who is asking. Built like the contact form, and
 * sent through submitDataRequestAction, which files it in /admin/contact.
 */
export function DataRequestForm({ dict }: { dict: Dictionary }) {
  const dr = dict.dataRequest;
  const cf = dict.contactForm;
  const pathname = usePathname();
  const { locale } = splitLocaleFromPathname(pathname);
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState<RequestType | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const validate = (): Errors => {
    const next: Errors = {};
    if (!type) next.type = dr.typeRequired;
    if (!name.trim()) next.name = cf.nameRequired;
    if (!email.trim()) next.email = cf.emailRequired;
    else if (!EMAIL_RE.test(email.trim())) next.email = cf.emailInvalid;
    return next;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;
    const next = validate();
    setErrors(next);
    const firstInvalid = FIELD_ORDER.find((key) => next[key]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus("submitting");
    const result = await submitDataRequestAction({ name, email, type, details, locale });
    if (!result.ok) {
      setErrors(result.errors ?? {});
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
        <p className="mt-6 text-eyebrow text-ink-muted">{dr.successLabel}</p>
        <p className="text-display-3 mt-2 max-w-md text-ink">{dr.successMessage}</p>
      </div>
    );
  }

  const error = (field: Field) =>
    errors[field] && (
      <p id={`${uid}-${field}-error`} role="alert" className="mt-1.5 text-meta text-danger">
        {errors[field]}
      </p>
    );
  const describedBy = (field: Field) => (errors[field] ? `${uid}-${field}-error` : undefined);

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit}>
      <fieldset aria-describedby={describedBy("type")}>
        <legend className="text-title text-ink">{dr.typeLabel}</legend>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {TYPES.map((value) => (
            <label
              key={value}
              className={cn(
                "flex min-h-13 cursor-pointer items-center gap-3 rounded-sm border bg-canvas px-4 py-3 text-[0.9375rem] font-medium text-ink",
                "transition-[border-color,box-shadow] duration-[var(--duration-fast)]",
                "has-[:checked]:border-ink has-[:checked]:shadow-[0_0_0_1px_var(--color-ink)]",
                errors.type ? "border-danger" : "border-line-strong hover:border-ink-faint",
              )}
            >
              <input
                type="radio"
                name="type"
                value={value}
                checked={type === value}
                onChange={() => {
                  setType(value);
                  setErrors((e) => ({ ...e, type: undefined }));
                }}
                className="size-4.5 shrink-0 accent-ink focus-visible:outline-ink"
              />
              {dr.types[value]}
            </label>
          ))}
        </div>
        {error("type")}
      </fieldset>

      <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className="block text-[0.9375rem] font-medium text-ink">
            {cf.nameLabel}
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            autoComplete="name"
            required
            value={name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("name")}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass(Boolean(errors.name))}
          />
          {error("name")}
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className="block text-[0.9375rem] font-medium text-ink">
            {dr.emailLabel}
          </label>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy("email")}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass(Boolean(errors.email))}
          />
          {error("email")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-details`} className="block text-[0.9375rem] font-medium text-ink">
            {dr.detailsLabel}
            <span className="ml-1.5 font-normal text-ink-muted">{cf.optionalSuffix}</span>
          </label>
          <textarea
            id={`${uid}-details`}
            name="details"
            rows={4}
            maxLength={3000}
            value={details}
            aria-invalid={errors.details ? true : undefined}
            aria-describedby={describedBy("details")}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={dr.detailsHint}
            className={cn(fieldClass(Boolean(errors.details)), "min-h-[132px] resize-y")}
          />
          {error("details")}
        </div>
      </div>

      <Button type="submit" size="lg" arrow className="mt-8" disabled={status === "submitting"}>
        {status === "submitting" ? cf.sending : dr.send}
      </Button>
    </form>
  );
}
