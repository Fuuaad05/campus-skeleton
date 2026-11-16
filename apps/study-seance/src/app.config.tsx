import { Meter } from "@campus/skeleton";
import type { AppConfig, Item } from "@campus/skeleton";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function members(item: Item): string[] {
  const m = item.values.members;
  return Array.isArray(m) ? m.map(String) : [];
}

function capacity(item: Item): number {
  return typeof item.values.capacity === "number" ? item.values.capacity : 0;
}

/** App 2: a study group matcher. The same skeleton, different fields, actions and theme. */
export const config: AppConfig = {
  id: "study-seance",
  name: "Study Séance",
  tagline: "Gather the living to revise the dead material.",
  emoji: "🕯️",
  theme: { mode: "light", accent: "#c2571a", accentText: "#ffffff", accent2: "#8a3ffc" },
  itemName: { singular: "Session", plural: "Sessions" },
  titleField: "topic",
  summaryField: "notes",
  pills: ["level"],
  fields: [
    { key: "topic", label: "Topic", type: "text", required: true, placeholder: "Dynamic programming, chapters 5 to 7", searchable: true },
    { key: "course", label: "Course", type: "text", required: true, placeholder: "CS 301", filterable: true, searchable: true },
    { key: "level", label: "Pace", type: "select", options: ["Cramming", "Steady", "Deep dive"], required: true, default: "Steady", filterable: true },
    { key: "when", label: "When", type: "datetime", required: true },
    { key: "place", label: "Where", type: "text", required: true, placeholder: "Library room 3, or a Zoom link", searchable: true },
    { key: "capacity", label: "Seats", type: "number", required: true, min: 2, max: 30, default: 5, help: "Including you.", hideInCard: true },
    { key: "notes", label: "Notes", type: "longtext", placeholder: "Bring past exams and snacks", searchable: true },
    { key: "members", label: "Who is coming", type: "people", default: [], hideInCard: true },
  ],
  status: {
    options: { Open: "ok", Full: "warn", Past: "muted" },
    of: (item, now) => {
      const when = typeof item.values.when === "number" ? item.values.when : 0;
      if (when < now) return "Past";
      return members(item).length >= capacity(item) ? "Full" : "Open";
    },
  },
  beforeCreate: (values, me) => ({ ...values, members: [me] }),
  renderExtra: (item) => <Meter label="Seats taken" value={members(item).length} max={capacity(item)} />,
  actions: [
    {
      id: "join",
      label: "Join",
      tone: "primary",
      visible: (item, { me, now }) => {
        const when = typeof item.values.when === "number" ? item.values.when : 0;
        return when > now && !members(item).includes(me) && members(item).length < capacity(item);
      },
      run: (item, { me }) => ({ members: [...members(item), me] }),
      toast: "You are in. See you there.",
    },
    {
      id: "leave",
      label: "Leave",
      visible: (item, { me, now }) => {
        const when = typeof item.values.when === "number" ? item.values.when : 0;
        return when > now && members(item).includes(me) && item.createdBy !== me;
      },
      run: (item, { me }) => ({ members: members(item).filter((m) => m !== me) }),
      toast: "You left the session.",
    },
  ],
  seed: (now) => [
    {
      createdBy: "Library Ghoul 12",
      values: {
        topic: "Dynamic programming, chapters 5 to 7",
        course: "CS 301",
        level: "Deep dive",
        when: now + 1 * DAY + 2 * HOUR,
        place: "Library, room 3",
        capacity: 5,
        notes: "We will solve the last three midterms. Bring a laptop.",
        members: ["Library Ghoul 12", "Sleepy Specter 41", "Wandering Wraith 58"],
      },
    },
    {
      createdBy: "Friendly Banshee 23",
      values: {
        topic: "Integration by parts crash course",
        course: "MATH 202",
        level: "Cramming",
        when: now + 5 * HOUR,
        place: "Zoom (link in the group chat)",
        capacity: 4,
        notes: "Quiz tomorrow morning. Pizza optional.",
        members: ["Friendly Banshee 23", "Midnight Mummy 77", "Curious Poltergeist 30", "Library Ghoul 12"],
      },
    },
    {
      createdBy: "Midnight Mummy 77",
      values: {
        topic: "Essay peer review: The Gothic Novel",
        course: "ENG 210",
        level: "Steady",
        when: now + 3 * DAY,
        place: "Cafe by the quad",
        capacity: 6,
        notes: "Swap drafts and give each other feedback.",
        members: ["Midnight Mummy 77"],
      },
    },
    {
      createdBy: "Curious Poltergeist 30",
      values: {
        topic: "Circuits lab 4 debrief",
        course: "PHYS 101",
        level: "Steady",
        when: now - 2 * DAY,
        place: "Physics building, room P12",
        capacity: 4,
        notes: "Compared results and fixed the wiring diagrams.",
        members: ["Curious Poltergeist 30", "Sleepy Specter 41"],
      },
    },
  ],
};
