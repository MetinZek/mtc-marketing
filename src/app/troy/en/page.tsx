import type { Metadata } from "next";
import { TroySite } from "@/troy/components/TroySite";
import { DICTS } from "@/troy/i18n";

export const metadata: Metadata = {
  title: DICTS.en.meta.title,
  description: DICTS.en.meta.description,
  alternates: { canonical: "/troy/en", languages: { sq: "/troy", en: "/troy/en" } },
  openGraph: { title: DICTS.en.meta.title, description: DICTS.en.meta.description, images: ["/troy/render.webp"] },
};

export default function TroyEnglishPage() {
  return <TroySite lang="en" />;
}
