/** Factual copy paraphrased from docs/content/sandy-rahmansyah.md. */
export const EXPERIENCE = [
  { organization: 'Member.id', dates: 'August 2022–Present', role: 'Frontend Developer', detail: 'Building customer and admin interfaces for Solva, Solva Reservation, and custom client applications: loyalty, CRM, vouchers, and reporting. Developing reusable frontend modules and checking releases with Vitest, Jest, and manual testing before QA.' },
  { organization: 'PT. Gramedia Asri Media', dates: 'January 2021–July 2022', role: 'Frontend Developer', detail: 'Worked on the Mitra Gramedia partner marketplace, e-Perpus digital library systems, content management systems, and internal dashboards, with contributions to Gramedia.com. Used Vue, Nuxt, React, Next.js, and AngularJS across projects.' },
  { organization: 'Superhand', dates: 'January–June 2021', role: 'Frontend Developer · Part-time', detail: 'Built responsive Superhand and WasiatOnline landing pages with Vue and Nuxt, integrated backend APIs, and improved performance. This part-time role overlapped with Gramedia employment.' },
  { organization: 'Lintasmaya Multi Media', dates: 'October–December 2020', role: 'Frontend Developer', detail: 'Built a WordPress company landing page and a Vue/Nuxt product catalog, collaborating with backend developers and supporting deployment.' },
  { organization: 'Edutore by Gramedia', dates: 'December 2019–July 2020', role: 'Frontend Developer', detail: 'Developed the Edutore Try-Out school practice-exam application and CMS interfaces with Vue and Nuxt. Delivered features, fixed bugs, and worked on stability and performance.' },
];
export const SKILL_GROUPS = [
  { title: 'Languages & web', items: ['JavaScript', 'TypeScript', 'HTML', 'CSS'] },
  { title: 'Frameworks', items: ['Vue.js', 'Nuxt.js', 'React', 'Next.js', 'AngularJS'] },
  { title: 'State & data', items: ['Pinia', 'React Query'] },
  { title: 'Interfaces', items: ['Tailwind CSS', 'Element Plus', 'shadcn/ui', 'Vuetify', 'Bootstrap', 'TanStack Table'] },
  { title: 'API integration', items: ['REST', 'Axios'] },
  { title: 'Testing', items: ['Vitest', 'Jest', 'Manual testing'] },
  { title: 'Content management', items: ['WordPress'] },
  { title: 'Backend · personal projects', items: ['Node.js', 'Express.js', 'NestJS'], note: 'Working knowledge developed in personal projects.' },
];
export const DEMO_PROJECTS = [
  { id: 'harbor', name: 'Harbor', category: 'Booking interface', description: 'An imagined seaside stay, with a calm booking flow and room to compare dates and places.', stack: ['Vue.js', 'Nuxt.js', 'Tailwind CSS'] },
  { id: 'fieldnotes', name: 'Fieldnotes', category: 'Publishing dashboard', description: 'An imagined workspace for collecting ideas, organizing drafts, and planning the next story.', stack: ['React', 'Next.js', 'TanStack Table'] },
  { id: 'market', name: 'Little Market', category: 'Storefront', description: 'An imagined neighborhood shop, with a simple catalog of thoughtfully made everyday objects.', stack: ['React', 'Next.js', 'React Query'] },
] as const;
