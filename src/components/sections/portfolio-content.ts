/** Factual copy paraphrased from docs/content/sandy-rahmansyah.md. */
export const EXPERIENCE = [
  {
    organization: "Member.id",
    dates: "August 2022 – Present",
    role: "Frontend Developer",
    detail:
      "Building customer and admin interfaces for Solva, Solva Reservation, and custom client applications: loyalty, CRM, vouchers, and reporting. Developing reusable frontend modules and checking releases with Vitest, Jest, and manual testing before QA.",
  },
  {
    organization: "PT. Gramedia Asri Media",
    dates: "January 2021–July 2022",
    role: "Frontend Developer",
    detail:
      "Worked on the Mitra Gramedia partner marketplace, e-Perpus digital library systems, content management systems, and internal dashboards, with contributions to Gramedia.com. Used Vue, Nuxt, React, Next.js, and AngularJS across projects.",
  },
  {
    organization: "Superhand",
    dates: "January – June 2021",
    role: "Frontend Developer · Part-time",
    detail:
      "Built responsive Superhand and WasiatOnline landing pages with Vue and Nuxt, integrated backend APIs, and improved performance. This part-time role overlapped with Gramedia employment.",
  },
  {
    organization: "Lintasmaya Multi Media",
    dates: "October – December 2020",
    role: "Frontend Developer",
    detail:
      "Built a WordPress company landing page and a Vue/Nuxt product catalog, collaborating with backend developers and supporting deployment.",
  },
  {
    organization: "Edutore by Gramedia",
    dates: "December 2019 – July 2020",
    role: "Frontend Developer",
    detail:
      "Developed the Edutore Try-Out school practice-exam application and CMS interfaces with Vue and Nuxt. Delivered features, fixed bugs, and worked on stability and performance.",
  },
];
/** Expanded technology list and favorite stack supplied by Sandy after UI selection. */
export const FAVORITE_STACK = [
  "Vue.js",
  "shadcn/ui",
  "NestJS",
  "PostgreSQL",
  "Vitest",
  "Bun",
];
export const SKILL_GROUPS = [
  {
    title: "Frontend Ecosystem",
    items: ["Vue.js", "React", "Angular", "Nuxt.js", "Next.js", "Astro"],
  },
  {
    title: "UI & Styling",
    items: [
      "Tailwind CSS",
      "shadcn/ui",
      "Bootstrap",
      "Vuetify",
      "Element Plus",
    ],
  },
  { title: "Mobile Ecosystem", items: ["React Native", "Flutter", "Swift"] },
  {
    title: "Backend Ecosystem",
    items: ["Express.js", "NestJS", "Laravel", "Golang"],
  },
  {
    title: "Other",
    items: [
      "Node.js",
      "Bun",
      "Yarn",
      "Jest",
      "Vitest",
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "PHP",
      "Sass",
      "Docker",
      "Git",
      "PostgreSQL",
      "MongoDB",
      "MySQL",
      "Nginx",
      "Figma",
    ],
  },
];
export const DEMO_PROJECTS = [
  {
    id: "harbor",
    name: "Harbor",
    category: "Booking interface",
    description:
      "An imagined seaside stay, with a calm booking flow and room to compare dates and places.",
    stack: ["Vue.js", "Nuxt.js", "Tailwind CSS"],
  },
  {
    id: "fieldnotes",
    name: "Fieldnotes",
    category: "Publishing dashboard",
    description:
      "An imagined workspace for collecting ideas, organizing drafts, and planning the next story.",
    stack: ["React", "Next.js", "TanStack Table"],
  },
  {
    id: "market",
    name: "Little Market",
    category: "Storefront",
    description:
      "An imagined neighborhood shop, with a simple catalog of thoughtfully made everyday objects.",
    stack: ["React", "Next.js", "React Query"],
  },
] as const;

/** Gallery data. Personal entries remain concepts; Solva/Mitra stacks are user-approved temporary tags. */
export interface GalleryProject {
  id: string;
  name: string;
  context: string;
  description: string;
  stack: readonly string[];
  preview?: "harbor" | "fieldnotes" | "market";
  image?: { src: string; alt: string; width: number; height: number };
}
export const PROJECT_GROUPS: {
  id: string;
  title: string;
  description: string;
  projects: GalleryProject[];
}[] = [
  {
    id: "personal",
    title: "Personal projects",
    description: "A space to explore ideas and interfaces.",
    projects: DEMO_PROJECTS.map((project) => ({
      ...project,
      context: "Personal · Interface concept",
      preview: project.id,
    })),
  },
  {
    id: "work",
    title: "Work projects",
    description: "Products built alongside teams.",
    projects: [
      {
        id: "solva",
        name: "Solva & Solva Reservation",
        context: "Member.id",
        description:
          "Customer and admin interfaces for loyalty, CRM, vouchers, reporting, and reservations.",
        stack: ["Vue.js", "Nuxt.js", "Tailwind CSS"],
      },
      {
        id: "mitra",
        name: "Mitra Gramedia",
        context: "PT. Gramedia Asri Media",
        description: "Frontend development for Gramedia’s partner marketplace.",
        stack: ["Vue.js", "Nuxt.js", "Element Plus"],
      },
      {
        id: "edutore",
        name: "Edutore Try-Out",
        context: "Edutore by Gramedia",
        description:
          "School practice-exam application and content management interfaces.",
        stack: ["Vue.js", "Nuxt.js"],
      },
    ],
  },
];
