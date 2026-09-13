import type { TeamMember } from "../types";

/**
 * Placeholder team — replace names, roles and portraits with real
 * people before publishing. Portraits are hand-built abstract
 * compositions under /public/team (shape + one accent, no stock
 * photography), matching the rest of the placeholder media. Set
 * `published: false` to hide a member without deleting the record.
 */
export const team: TeamMember[] = [
  {
    id: "tm-1",
    name: "Placeholder Name",
    role: "Founder / Creative Director",
    bio: "Leads brand and creative direction across engagements.",
    portrait: {
      src: "/team/member-1.svg",
      alt: "Placeholder studio portrait — an abstract head-and-shoulders composition.",
      width: 640,
      height: 800,
    },
    order: 1,
    published: true,
  },
  {
    id: "tm-2",
    name: "Placeholder Name",
    role: "Strategy Lead",
    bio: "Owns positioning, research, and measurement.",
    portrait: {
      src: "/team/member-2.svg",
      alt: "Placeholder studio portrait — an abstract outlined head-and-shoulders composition.",
      width: 640,
      height: 800,
    },
    order: 2,
    published: true,
  },
  {
    id: "tm-3",
    name: "Placeholder Name",
    role: "Head of Technology",
    bio: "Runs product design and engineering delivery.",
    portrait: {
      src: "/team/member-3.svg",
      alt: "Placeholder studio portrait — an abstract split head-and-shoulders composition.",
      width: 640,
      height: 800,
    },
    order: 3,
    published: true,
  },
];
