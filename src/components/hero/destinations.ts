/** Shared guide/navigation content; asset IDs retain the calibrated scene mapping. */
export const DESTINATIONS = [
  {
    id: "about",
    label: "About",
    icon: "house",
    assetId: "ASSET-05",
    description:
      "The SR monument — an introduction and the story behind the island.",
  },
  {
    id: "projects",
    label: "Projects",
    icon: "layers",
    assetId: "ASSET-02",
    description: "The creator’s house — a place for projects and things made.",
  },
  {
    id: "skills",
    label: "Skills",
    icon: "leaf",
    assetId: "ASSET-04",
    description: "The greenhouse — tools, skills and growing knowledge.",
  },
  {
    id: "experience",
    label: "Experience",
    icon: "map",
    assetId: "ASSET-03",
    description: "The workshop — the journey and experience so far.",
  },
  {
    id: "contact",
    label: "Contact",
    icon: "mail",
    assetId: "ASSET-06",
    description: "The lighthouse — a place to connect.",
  },
] as const;
