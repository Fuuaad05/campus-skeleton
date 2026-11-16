import type { AppConfig, Field, Item } from "./types";

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

export function defaultValues(fields: Field[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.default !== undefined) out[f.key] = f.default;
    else if (f.type === "people") out[f.key] = [];
    else if (f.type === "select" && f.required && f.options?.length) out[f.key] = f.options[0];
  }
  return out;
}

/** Returns a map of field key to error message. An empty map means the values are valid. */
export function validate(fields: Field[], values: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    if (f.hideInForm || f.type === "people") continue;
    const v = values[f.key];
    const empty = v === undefined || v === null || v === "" || (typeof v === "number" && Number.isNaN(v));
    if (empty) {
      if (f.required) errors[f.key] = `${f.label} is required.`;
      continue;
    }
    if (f.type === "number") {
      if (typeof v !== "number" || !Number.isFinite(v)) errors[f.key] = `${f.label} must be a number.`;
      else if (f.min !== undefined && v < f.min) errors[f.key] = `${f.label} must be at least ${f.min}.`;
      else if (f.max !== undefined && v > f.max) errors[f.key] = `${f.label} must be at most ${f.max}.`;
    } else if (f.type === "datetime") {
      if (typeof v !== "number" || !Number.isFinite(v)) errors[f.key] = `${f.label} must be a valid date.`;
    } else if (f.type === "select") {
      if (typeof v !== "string" || (f.options && !f.options.includes(v))) errors[f.key] = `Pick a ${f.label.toLowerCase()}.`;
    }
  }
  return errors;
}

export function formatValue(field: Field, value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  switch (field.type) {
    case "datetime":
      return typeof value === "number"
        ? new Date(value).toLocaleString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : "";
    case "people":
      return Array.isArray(value) ? value.join(", ") : "";
    default:
      return String(value);
  }
}

export function toLocalInput(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function titleOf(config: AppConfig, item: Item): string {
  return String(item.values[config.titleField] ?? "Untitled");
}

export function matchesQuery(config: AppConfig, item: Item, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const keys = new Set([config.titleField, ...config.fields.filter((f) => f.searchable).map((f) => f.key)]);
  for (const key of keys) {
    const v = item.values[key];
    if (typeof v === "string" && v.toLowerCase().includes(q)) return true;
  }
  return false;
}

/** Values for a filter dropdown: the options of a select field, or the distinct values of a text field. */
export function filterChoices(field: Field, items: Item[]): string[] {
  if (field.type === "select" && field.options) return field.options;
  const set = new Set<string>();
  for (const i of items) {
    const v = i.values[field.key];
    if (typeof v === "string" && v.trim()) set.add(v.trim());
  }
  return [...set].sort();
}

/** Accepts untrusted JSON and returns only well-formed items. */
export function parseItems(raw: unknown): Item[] | null {
  const list = Array.isArray(raw) ? raw : raw && typeof raw === "object" ? (raw as { items?: unknown }).items : null;
  if (!Array.isArray(list)) return null;
  const out: Item[] = [];
  for (const r of list) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.values !== "object" || o.values === null || Array.isArray(o.values)) continue;
    out.push({
      id: o.id,
      createdAt: typeof o.createdAt === "number" ? o.createdAt : Date.now(),
      createdBy: typeof o.createdBy === "string" ? o.createdBy : "Unknown",
      values: o.values as Record<string, unknown>,
    });
  }
  return out;
}
