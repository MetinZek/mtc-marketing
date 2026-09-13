"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/_actions";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <p className="label text-ink-muted">MTC · Admin</p>
      <h1 className="text-display-3 mt-2 text-ink">Sign in</h1>

      <form action={formAction} className="mt-8 space-y-4">
        <label className="block">
          <span className="label block text-ink-muted">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            autoFocus
            required
            className="mt-2 w-full rounded-sm border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-blue"
          />
        </label>

        {state.error && (
          <p role="alert" className="text-meta text-danger">
            {state.error}
          </p>
        )}

        <Button size="md" disabled={isPending} className="w-full">
          {isPending ? "Checking…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
