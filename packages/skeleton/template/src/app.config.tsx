import type { AppConfig } from "@campus/skeleton";

/**
 * Describe your app here. This one file is the whole app.
 * See the two real examples in apps/lost-and-found and apps/study-seance.
 */
export const config: AppConfig = {
  id: "__NAME__",
  name: "__NAME__",
  tagline: "Describe what this app is for.",
  emoji: "🎃",
  theme: { mode: "dark", accent: "#ff8a3d", accentText: "#2a1200", accent2: "#c04bff" },
  itemName: { singular: "Post", plural: "Posts" },
  titleField: "title",
  summaryField: "body",
  fields: [
    { key: "title", label: "Title", type: "text", required: true, searchable: true },
    { key: "body", label: "Details", type: "longtext", searchable: true },
  ],
  seed: () => [{ values: { title: "Hello from the skeleton", body: "Edit app.config.tsx to make this yours." } }],
};
