/** Public profile and SEO defaults. Keep the production URL here in sync with your domain. */
export const SITE = {
  url: 'https://sandyrahmansyah.com',
  name: 'Sandy Rahmansyah',
  role: 'Frontend Developer',
  locale: 'en_US',
  language: 'en',
  location: { city: 'Jakarta', country: 'Indonesia', countryCode: 'ID' },
  image: {
    path: '/assets/seo/sandy-rahmansyah-social.jpg',
    width: 1200,
    height: 630,
    alt: 'Sandy Rahmansyah — Frontend Developer. Vue, Nuxt, React, and Next.js.',
  },
  portrait: '/assets/profile/sandy-rahmansyah.webp',
  profiles: [
    'https://www.linkedin.com/in/sandy-rahmansyah/',
    'https://github.com/sandyadzim',
    'https://www.instagram.com/rahmansyah_sandy',
  ],
  skills: ['JavaScript', 'TypeScript', 'Vue.js', 'Nuxt.js', 'React', 'Next.js', 'Responsive web design', 'Frontend development'],
  pages: {
    home: {
      title: 'Sandy Rahmansyah — Frontend Developer',
      description: 'Sandy Rahmansyah is a frontend developer in Jakarta, Indonesia, with 6+ years of experience building polished websites and web apps with Vue, Nuxt, React, and Next.js.',
    },
    portfolio: {
      title: 'Projects & Experience — Sandy Rahmansyah',
      description: 'Explore Sandy Rahmansyah’s frontend projects, including Solva, Solva Reservation, and Mitra Gramedia, plus skills, work experience, and contact details.',
    },
  },
} as const;

export type SeoPage = keyof typeof SITE.pages;
