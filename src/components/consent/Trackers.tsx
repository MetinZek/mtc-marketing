"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { tracking } from "@/config/tracking";
import { useConsent } from "@/lib/consent";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: Fbq;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

function addScript(src: string) {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

/** Google's gtag.js setup, with advertising storage kept off. */
function loadGoogleAnalytics(id: string) {
  const dataLayer = (window.dataLayer ??= []);
  window.gtag = function gtag() {
    // gtag.js reads the arguments object itself, not an array.
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  window.gtag("js", new Date());
  window.gtag("config", id);
  addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
}

/** Meta's Pixel base code, as in its snippet, then the first page view. */
function loadMetaPixel(id: string) {
  if (!window.fbq) {
    const fbq = function () {
      // The Pixel script replays the queued arguments objects as they are.
      // eslint-disable-next-line prefer-rest-params
      const args = arguments;
      if (fbq.callMethod) fbq.callMethod(...Array.from(args));
      else fbq.queue.push(args);
    } as unknown as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq ??= fbq;
    addScript("https://connect.facebook.net/en_US/fbevents.js");
  }
  window.fbq("consent", "grant");
  window.fbq("init", id);
  window.fbq("track", "PageView");
}

/** Expires cookies on this host and each parent domain (where these tools set them). */
function expireCookies(matches: (name: string) => boolean) {
  const names = document.cookie
    .split("; ")
    .map((pair) => pair.split("=")[0])
    .filter((name) => name && matches(name));
  const labels = window.location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < labels.length - 1; i++) domains.push(`; Domain=.${labels.slice(i).join(".")}`);
  for (const name of names) {
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; Path=/${domain}`;
  }
}

/**
 * Loads Google Analytics and the Meta Pixel, each only once the visitor has
 * allowed its kind in the cookie banner, and only if it is set up (an ID in
 * src/config/tracking.ts). Renders nothing.
 *
 * A tool that has started can't be unloaded, so when a choice is withdrawn
 * it is told so, its cookies are cleared and the page reloads without it.
 * Google Analytics counts in-app page changes itself (from the browser
 * history); the Pixel is sent a page view on each one.
 */
export function Trackers() {
  const { ready, choice } = useConsent();
  const pathname = usePathname();
  const started = useRef({ analytics: false, marketing: false });
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (!ready) return;
    const analytics = Boolean(choice?.analytics && tracking.googleAnalyticsId);
    const marketing = Boolean(choice?.marketing && tracking.metaPixelId);
    const run = started.current;

    if (analytics && !run.analytics) {
      run.analytics = true;
      loadGoogleAnalytics(tracking.googleAnalyticsId);
    }
    if (marketing && !run.marketing) {
      run.marketing = true;
      loadMetaPixel(tracking.metaPixelId);
    }

    const stopAnalytics = run.analytics && !analytics;
    const stopMarketing = run.marketing && !marketing;
    if (stopAnalytics) {
      window.gtag?.("consent", "update", { analytics_storage: "denied" });
      expireCookies((name) => name === "_ga" || name.startsWith("_ga_") || name === "_gid");
    }
    if (stopMarketing) {
      window.fbq?.("consent", "revoke");
      expireCookies((name) => name === "_fbp" || name === "_fbc");
    }
    if (stopAnalytics || stopMarketing) window.location.reload();
  }, [ready, choice]);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (started.current.marketing) window.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}
