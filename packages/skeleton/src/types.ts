import type { ReactNode } from "react";

export type FieldType = "text" | "longtext" | "number" | "select" | "datetime" | "people";

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  /** Choices for `select` fields. */
  options?: string[];
  placeholder?: string;
  help?: string;
  min?: number;
  max?: number;
  default?: unknown;
  /** Include this field in the search box. The title field is always searched. */
  searchable?: boolean;
  /** Add a filter for this field. Works for `select` and `text` fields. */
  filterable?: boolean;
  hideInForm?: boolean;
  hideInCard?: boolean;
}

export interface Item {
  id: string;
  createdAt: number;
  createdBy: string;
  values: Record<string, unknown>;
}

export type Tone = "ok" | "warn" | "bad" | "info" | "muted";

export interface ActionContext {
  me: string;
  now: number;
}

export interface ItemAction {
  id: string;
  label: string;
  tone?: "primary" | "danger" | "plain";
  /** Return false to hide the action for this item and user. */
  visible?: (item: Item, ctx: ActionContext) => boolean;
  /** Return the values to merge into the item. */
  run: (item: Item, ctx: ActionContext) => Record<string, unknown>;
  /** Message shown in a toast after the action runs. */
  toast?: string;
}

export interface Theme {
  mode: "dark" | "light";
  accent: string;
  /** Text colour on top of the accent colour. */
  accentText?: string;
}

export interface SeedItem {
  createdBy?: string;
  values: Record<string, unknown>;
}

export interface AppConfig {
  /** Unique id. Used as the localStorage key, so changing it resets the data. */
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  theme: Theme;
  itemName: { singular: string; plural: string };
  fields: Field[];
  /** Key of the field used as the item title. */
  titleField: string;
  /** Key of a longtext field shown as a short summary on cards. */
  summaryField?: string;
  /** Keys of fields shown as small pills at the top of each card. */
  pills?: string[];
  /** A workflow status. Each state gets a colour and a filter chip. */
  status?: {
    options: Record<string, Tone>;
    of: (item: Item, now: number) => string;
  };
  actions?: ItemAction[];
  /** Adjust values just before a new item is saved. */
  beforeCreate?: (values: Record<string, unknown>, me: string) => Record<string, unknown>;
  /** Extra content rendered on cards and in the detail view. */
  renderExtra?: (item: Item, now: number) => ReactNode;
  /** Sample items shown the first time the app opens. */
  seed?: (now: number) => SeedItem[];
  /** The opening section of the page. Skip it for a plain list. */
  hero?: HeroConfig;
}

export interface HeroConfig {
  eyebrow?: string;
  headline: string;
  lede: string;
  /** Opens the create form. */
  primaryCta: string;
  /** Scrolls to the list. */
  secondaryCta?: string;
  /** Artwork on the right. It receives live data, so it can show real items. */
  art?: (ctx: { items: Item[]; now: number }) => ReactNode;
}
