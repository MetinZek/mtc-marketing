import { useSyncExternalStore } from "react";
import { consentCategories, type ConsentCategory } from "@/config/tracking";

/**
 * The visitor's cookie choice, kept in one first-party cookie
 * (`mtc_consent`, six months) so it is asked once and can be changed at any
 * time from the footer's "Cookie settings". A small store shared by the
 * banner, the trackers and the dock (which steps aside while the banner is
 * up). Nothing optional is on until it is chosen.
 *
 * Bump CONSENT_VERSION when the tools or what they do change in a way the
 * visitor should be asked about again; older choices are then ignored.
 */

export type ConsentChoice = Record<ConsentCategory, boolean>;

type ConsentState = {
  /** False on the server and during hydration, when the cookie is unknown. */
  ready: boolean;
  /** The saved choice, or null if the visitor hasn't made one yet. */
  choice: ConsentChoice | null;
  /** The settings view, opened from the footer or the banner. */
  settingsOpen: boolean;
};

const COOKIE = "mtc_consent";
const CONSENT_VERSION = 1;
const MAX_AGE = 60 * 60 * 24 * 182;

const SERVER_STATE: ConsentState = { ready: false, choice: null, settingsOpen: false };

/** Reads e.g. "v1.a1.m0" from the cookie. */
function readCookie(): ConsentChoice | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  if (!match?.[1]) return null;
  const [version, analytics, marketing] = decodeURIComponent(match[1]).split(".");
  if (version !== `v${CONSENT_VERSION}`) return null;
  return { analytics: analytics === "a1", marketing: marketing === "m1" };
}

function writeCookie(choice: ConsentChoice) {
  const value = `v${CONSENT_VERSION}.a${choice.analytics ? 1 : 0}.m${choice.marketing ? 1 : 0}`;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

// In the browser the cookie is read as soon as this module loads; React
// still hydrates with the server's state and then catches up.
let state: ConsentState =
  typeof document === "undefined" ? SERVER_STATE : { ready: true, choice: readCookie(), settingsOpen: false };
const listeners = new Set<() => void>();

function set(next: Partial<ConsentState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return SERVER_STATE;
}

/** The current consent state; re-renders when it changes. */
export function useConsent(): ConsentState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Whether the banner (first visit) or its settings are on screen. */
export function useConsentPanelOpen(): boolean {
  const { ready, choice, settingsOpen } = useConsent();
  return consentCategories.length > 0 && ready && (choice === null || settingsOpen);
}

/** Saves a choice (closing the banner and settings) for six months. */
export function saveConsent(choice: ConsentChoice) {
  writeCookie(choice);
  set({ choice, settingsOpen: false });
}

export function openConsentSettings() {
  set({ settingsOpen: true });
}

export function closeConsentSettings() {
  set({ settingsOpen: false });
}
