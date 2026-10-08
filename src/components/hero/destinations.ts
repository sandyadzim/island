/** Shared guide/navigation content; asset IDs retain the calibrated scene mapping. */
export const DESTINATIONS = [
  {
    id: "about",
    number: '01',
    label: "About",
    icon: "house",
    assetId: "ASSET-02",
    description:
      "The creator’s house — an introduction and the story behind the island.",
  },
  {
    id: "projects",
    number: '02',
    label: "Projects",
    icon: "layers",
    assetId: "ASSET-03",
    description: "The workshop — a place for projects and things made.",
  },
  {
    id: "skills",
    number: '03',
    label: "Skills",
    icon: "leaf",
    assetId: "ASSET-04",
    description: "The greenhouse — tools, skills and growing knowledge.",
  },
  {
    id: "experience",
    number: '04',
    label: "Experience",
    icon: "map",
    assetId: "ASSET-07",
    description: "The sailboat — the journey and experience so far.",
  },
  {
    id: "contact",
    number: '05',
    label: "Contact",
    icon: "mail",
    assetId: "ASSET-06",
    description: "The lighthouse — a place to connect.",
  },
] as const;
