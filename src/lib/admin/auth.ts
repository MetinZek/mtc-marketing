import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  verifySessionToken,
} from "./session";

/** Read + verify the session cookie on the current request. */
export async function hasValidSession(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Redirect to the login page unless a valid session is present. */
export async function requireSession(): Promise<void> {
  if (!(await hasValidSession())) redirect("/admin/login");
}

/** Set a fresh signed session cookie (call from the login action). */
export async function startSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

/** Clear the session cookie (call from the logout action). */
export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export { SESSION_COOKIE } from "./session";
