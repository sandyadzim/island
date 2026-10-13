/** Factual copy paraphrased from docs/content/sandy-rahmansyah.md. */
export const EXPERIENCE = [
  {
    organization: 'Member.id',
    dates: 'August 2022 – Present',
    role: 'Frontend Developer',
    detail:
      'Building customer and admin interfaces for Solva, Solva Reservation, and custom client applications: loyalty, CRM, vouchers, and reporting. Developing reusable frontend modules and checking releases with Vitest, Jest, and manual testing before QA.',
  },
  {
    organization: 'PT. Gramedia Asri Media',
    dates: 'January 2021–July 2022',
    role: 'Frontend Developer',
    detail:
      'Worked on the Mitra Gramedia partner marketplace, e-Perpus digital library systems, content management systems, and internal dashboards, with contributions to Gramedia.com. Used Vue, Nuxt, React, Next.js, and AngularJS across projects.',
  },
  {
    organization: 'Superhand',
    dates: 'January – June 2021',
    role: 'Frontend Developer · Part-time',
    detail:
      'Built responsive Superhand and WasiatOnline landing pages with Vue and Nuxt, integrated backend APIs, and improved performance. This part-time role overlapped with Gramedia employment.',
  },
  {
    organization: 'Lintasmaya Multi Media',
    dates: 'October – December 2020',
    role: 'Frontend Developer',
    detail:
      'Built a WordPress company landing page and a Vue/Nuxt product catalog, collaborating with backend developers and supporting deployment.',
  },
  {
    organization: 'Edutore by Gramedia',
    dates: 'December 2019 – July 2020',
    role: 'Frontend Developer',
    detail:
      'Developed the Edutore Try-Out school practice-exam application and CMS interfaces with Vue and Nuxt. Delivered features, fixed bugs, and worked on stability and performance.',
  },
];
/** Expanded technology list and favorite stack supplied by Sandy after UI selection. */
export const FAVORITE_STACK = [
  'Vue.js',
  'shadcn/ui',
  'NestJS',
  'PostgreSQL',
  'Vitest',
];
export const SKILL_GROUPS = [
  {
    title: 'Languages & Web Technologies',
    items: ['JavaScript', 'TypeScript', 'PHP', 'HTML', 'CSS'],
  },
  {
    title: 'Frontend',
    items: ['Vue', 'React', 'Angular', 'Nuxt', 'Next', 'Astro'],
  },
  {
    title: 'UI & Styling',
    items: ['Tailwind', 'shadcn/ui', 'Element Plus', 'Vuetify', 'Bootstrap'],
  },
  { title: 'Testing', items: ['Vitest', 'Jest'] },
  { title: 'Mobile', items: ['React Native', 'Flutter'] },
  { title: 'Backend', items: ['Node.js', 'Express', 'Nest', 'Laravel'] },
  {
    title: 'Database & ORM',
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Prisma', 'Drizzle'],
  },
];
export const DEMO_PROJECTS = [
  {
    id: 'harbor',
    name: 'Harbor',
    category: 'Booking interface',
    description:
      'An imagined seaside stay, with a calm booking flow and room to compare dates and places.',
    stack: ['Vue.js', 'Nuxt.js', 'Tailwind CSS'],
  },
  {
    id: 'fieldnotes',
    name: 'Fieldnotes',
    category: 'Publishing dashboard',
    description:
      'An imagined workspace for collecting ideas, organizing drafts, and planning the next story.',
    stack: ['React', 'Next.js', 'TanStack Table'],
  },
  {
    id: 'market',
    name: 'Little Market',
    category: 'Storefront',
    description:
      'An imagined neighborhood shop, with a simple catalog of thoughtfully made everyday objects.',
    stack: ['React', 'Next.js', 'React Query'],
  },
] as const;

/** Gallery data. Personal entries remain concepts; work-project stacks are supplied by Sandy. */
export interface GalleryProject {
  id: string;
  name: string;
  context: string;
  description: string;
  stack: readonly string[];
  url?: string;
  preview?: 'harbor' | 'fieldnotes' | 'market';
  image?: { src: string; alt: string; width: number; height: number };
}
export const PROJECT_GROUPS: {
  id: string;
  title: string;
  description: string;
  projects: GalleryProject[];
}[] = [
  {
    id: 'personal',
    title: 'Personal projects',
    description: 'A space to explore ideas and interfaces.',
    projects: DEMO_PROJECTS.map((project) => ({
      ...project,
      context: 'Personal · Interface concept',
      preview: project.id,
    })),
  },
  {
    id: 'work',
    title: 'Work projects',
    description: 'Products built alongside teams.',
    projects: [
      {
        id: 'solva',
        url: 'https://member.id/products/solva',
        name: 'Solva',
        context: 'Member.id',
        description:
          'Solva is a loyalty program solution built to boost customer engagement and strengthen brand loyalty. With a rich set of features, it helps you reward your customers more effectively and keep them coming back.',
        stack: ['Vue.js', 'Tailwind CSS', 'Element Plus'],
        image: {
          src: '/assets/projects/solva.webp',
          alt: 'Solva backoffice dashboard showing membership, active members, and points reports',
          width: 1598,
          height: 1078,
        },
      },
      {
        id: 'solva-reservation',
        url: 'https://member.id/products/reservation',
        name: 'Solva Reservation',
        context: 'Member.id',
        description:
          'Solva Reservation is an end-to-end dining solution that simplifies reservation management and optimizes table bookings. By cutting wait times and streamlining coordination, it improves guest satisfaction while helping your restaurant boost revenue, operate more efficiently, and retain more customers.',
        stack: ['Vue.js', 'Tailwind CSS', 'Element Plus'],
        image: {
          src: '/assets/projects/solva-reservation.webp',
          alt: 'Solva Reservation table-layout editor showing a restaurant floor plan and table settings',
          width: 1612,
          height: 1148,
        },
      },
      {
        id: 'mitra',
        url: 'https://mitra.gramedia.com/',
        name: 'Mitra Gramedia',
        context: 'PT. Gramedia Asri Media',
        description:
          'Mitra Gramedia is a platform that helps store owners and individual entrepreneurs offer a wide range of Gramedia products. It makes stocking your store easier through online wholesale shopping, complete with dropshipping services.',
        stack: ['Vue.js', 'Nuxt.js', 'Tailwind CSS'],
        image: {
          src: '/assets/projects/mitra-gramedia.webp',
          alt: 'Mitra Gramedia storefront showing its wholesale shopping banner, partner tier, and product catalog',
          width: 1972,
          height: 1038,
        },
      },
      {
        id: 'edutore',
        name: 'Edutore Try-Out',
        context: 'Edutore by Gramedia',
        description:
          'School practice-exam application and content management interfaces.',
        stack: ['Vue.js', 'Nuxt.js'],
      },
    ],
  },
];

/** Curated entries shown in the Projects dialog and reading page.
 * Change these IDs to select and order projects; the full gallery remains reusable.
 */
export const SELECTED_PROJECT_IDS = [
  'solva',
  'solva-reservation',
  'mitra',
] as const;
export const SELECTED_PROJECTS: GalleryProject[] = SELECTED_PROJECT_IDS.map(
  (id) => {
    const project = PROJECT_GROUPS.flatMap((group) => group.projects).find(
      (entry) => entry.id === id,
    );
    if (!project) throw new Error(`Unknown selected project: ${id}`);
    return project;
  },
);
