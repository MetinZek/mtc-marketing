"use client";

import type { ReactNode } from "react";

/** A submit button that asks for confirmation before the form posts. */
export function ConfirmSubmit({
  message,
  children,
  className,
}: {
  message: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
