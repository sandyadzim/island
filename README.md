# Sandy Rahmansyah — Island Portfolio

A personal portfolio for Sandy Rahmansyah, a frontend developer based in Jakarta,
Indonesia. An illustrated island brings together projects, skills, work experience,
and contact information through interactive landmarks and ambient animation.

The site offers two ways to explore: an interactive island at `/` and a reading
page at `/portfolio/` with the same portfolio content.

## Features

- Interactive landmarks open About, Projects, Skills, Experience, and Contact.
- Animated ocean, sailboat, clouds, birds, chimney smoke, and lighthouse lighting.
- Touch devices use a separate lightweight scene: one composited island image,
  static ocean, no WebGL or ambient effects, with Explore/Back and dialog motion retained.
- Responsive layouts with desktop dialogs and mobile bottom sheets.
- Keyboard navigation, focus management, reduced-motion support, and a saved
  pause/resume preference.
- Optional background music with visitor-controlled playback.
- Selected work projects: Solva, Solva Reservation, and Mitra Gramedia.
- Downloadable CV and links to LinkedIn, GitHub, Instagram, and email.
- A static reading page that works without JavaScript.
- Page-specific SEO metadata, canonical URLs, social preview cards, structured
  profile data, and a generated sitemap.

## Tech stack

| Technology                        | Purpose                                                |
| --------------------------------- | ------------------------------------------------------ |
| Astro 7                           | Components, routing, and static site generation        |
| TypeScript 6                      | Interaction logic and typed configuration              |
| Tailwind CSS 4 + custom CSS       | Styling, responsive layouts, and animation             |
| Web Animations API                | Interruptible island camera transitions                |
| WebGL                             | Animated ocean rendering with a static-image fallback  |
| Web Audio API                     | Background music playback and fades                    |
| WebP + SVG                        | Island artwork, portraits, project previews, and icons |
| Fontsource                        | Self-hosted Manrope and Space Grotesk fonts            |
| `@astrojs/sitemap`                | Sitemap generation during production builds            |
| Astro Check + Node.js test runner | Type checking and unit tests                           |

## Getting started

Use **Node.js 24.16+ (24.x) or 26.3+** and **npm 9.6.5 or newer**.

```sh
npm ci
npm run dev
```

Open the local URL printed by Astro in your terminal.

## Commands

| Command                 | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| `npm run dev`           | Start the development server                               |
| `npm run check`         | Check Astro and TypeScript files                           |
| `npm run lint`          | Lint JavaScript, TypeScript, and Astro files               |
| `npm run lint:fix`      | Apply automatic ESLint fixes                               |
| `npm run format`        | Format files with Prettier, including Astro components     |
| `npm run format:check`  | Check formatting without modifying files                   |
| `npm test`              | Run unit tests                                             |
| `npm run verify:assets` | Validate island asset files and dimensions                 |
| `npm run assets:mobile` | Regenerate the mobile island from registered source layers |
| `npm run build`         | Generate the production site in `dist/`                    |
| `npm run preview`       | Preview the production build locally                       |

ESLint uses recommended JavaScript, TypeScript, and Astro rules. Prettier handles
formatting separately with the official Astro plugin. Generated output and public
assets are excluded. In VS Code, install the recommended Astro, ESLint, and Prettier
extensions to enable formatting and lint fixes on save.

Setup follows the [Astro editor guide](https://docs.astro.build/en/editor-setup/).

## Project structure

```text
src/
  components/
    hero/          Introduction, identity, and navigation
    island/        Island layers, landmarks, and ambient effects
    sections/      Shared portfolio content and dialogs
    SeoHead.astro  Shared SEO metadata
  config/          Site identity and SEO configuration
  layouts/         Page layout
  pages/           Island, reading page, and robots.txt routes
  scripts/         Camera, navigation, dialogs, audio, and animation
  styles/          Global and component styles
  utils/           Scene geometry, transitions, and state helpers
public/
  assets/          Artwork, portraits, project images, icons, and social preview
  audio/           Background music
  downloads/       Downloadable CV
tests/             Unit tests, browser checks, and asset validation
```

The mobile artwork is generated with Sharp into ignored `src/generated/` before
dev, check, test, asset verification, and build. It retains the 1536 × 1056 frame,
including sky headroom, and is delivered by Astro with a content-hashed URL.
Source artwork, layer registration, draw order, and generator version determine
the generation cache; generated files do not need to be committed.

An inline gate selects `lite` for coarse-pointer or no-hover devices and `full`
otherwise, with a safe `lite` fallback. The choice stays fixed until navigation.
Only the selected inert scene template is mounted and only its controller is
imported. Desktop retains the original layered artwork and ambient renderer.
Mobile has no initial reveal or UI transitions beyond camera and dialog motion;
system reduced motion makes those immediate. The old desktop Pause preference
does not disable mobile camera/dialog motion. Music remains user-started.

Header and Intro content share a centered 96rem maximum width; the ocean remains
fixed across the entire viewport. The side-by-side composition requires both
1100px width and 720px height. Every other size stacks the hero before the island
over the same full-screen background, with natural scrolling when needed.

Without JavaScript, a static island and the Read Portfolio link remain available.
Artwork failures leave the shared content navigation available and do not start
the desktop renderer. Physical Safari testing is still required to confirm the
reported iPhone crash is resolved; desktop viewport emulation cannot certify it.

## Customization

- **Profile and SEO:** edit `src/config/site.ts` for the production domain, titles,
  descriptions, social links, and structured profile data.
- **Introduction:** edit `src/components/hero/HeroCard.astro` and
  `src/components/hero/HeroIdentity.astro`.
- **Portfolio content:** update the components in `src/components/sections/`.
  Projects, selected project IDs, skills, and experience are defined in
  `portfolio-content.ts` in that directory.
- **Artwork and downloads:** place public files in `public/` and update their
  references in the relevant components or configuration.

## Production build

```sh
npm run check
npm test
npm run verify:assets
npm run build
npm run preview
```

Deploy the generated `dist/` directory to a static hosting service. The production
URL is configured as `https://sandyrahmansyah.com` in `src/config/site.ts`; update
it before building for another domain. The build generates `robots.txt`,
`sitemap-index.xml`, and the page sitemap alongside the static HTML and assets.
