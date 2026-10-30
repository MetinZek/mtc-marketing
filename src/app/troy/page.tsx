import type { Metadata } from "next";
import { TroySite } from "@/troy/components/TroySite";
import { DICTS } from "@/troy/i18n";

export const metadata: Metadata = {
  title: DICTS.sq.meta.title,
  description: DICTS.sq.meta.description,
  alternates: { canonical: "/troy", languages: { sq: "/troy", en: "/troy/en" } },
  openGraph: { title: DICTS.sq.meta.title, description: DICTS.sq.meta.description, images: ["/troy/render.webp"] },
};

export default function TroyPage() {
  return <TroySite lang="sq" />;
}
