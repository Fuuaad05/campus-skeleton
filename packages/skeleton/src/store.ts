import { useCallback, useEffect, useState } from "react";
import type { AppConfig, Item } from "./types";
import { parseItems, uid } from "./utils";

function storageKey(config: AppConfig) {
  return `campus:${config.id}:v1`;
}

function load(config: AppConfig): Item[] {
  try {
    const text = localStorage.getItem(storageKey(config));
    if (text === null) {
      // First visit: show sample items so the app never opens empty.
      const now = Date.now();
      return (config.seed?.(now) ?? []).map((s, i) => ({
        id: uid(),
        createdAt: now - (i + 1) * 60_000,
        createdBy: s.createdBy ?? "Campus Ghost",
        values: s.values,
      }));
    }
    return parseItems(JSON.parse(text)) ?? [];
  } catch {
    return [];
  }
}

/** The whole data layer: a list of items kept in localStorage. */
export function useCollection(config: AppConfig) {
  const [items, setItems] = useState<Item[]>(() => load(config));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(config), JSON.stringify(items));
    } catch {
      // Storage may be full or blocked. The app keeps working in memory.
    }
  }, [config, items]);

  const add = useCallback((values: Record<string, unknown>, me: string) => {
    setItems((prev) => [{ id: uid(), createdAt: Date.now(), createdBy: me, values }, ...prev]);
  }, []);

  const update = useCallback((id: string, values: Record<string, unknown>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, values } : i)));
  }, []);

  const patch = useCallback((id: string, changes: Record<string, unknown>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, values: { ...i.values, ...changes } } : i)));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const replaceAll = useCallback((next: Item[]) => setItems(next), []);

  return { items, add, update, patch, remove, replaceAll };
}

const ME_KEY = "campus:me";

export function useMe() {
  const [me, setMeState] = useState<string>(() => {
    try {
      // Opening the app with ?me=Name picks a name without the prompt. Handy for demos and tests.
      const fromUrl = new URLSearchParams(window.location.search).get("me")?.trim().slice(0, 40);
      if (fromUrl) {
        localStorage.setItem(ME_KEY, fromUrl);
        return fromUrl;
      }
      return localStorage.getItem(ME_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const setMe = useCallback((name: string) => {
    const clean = name.trim().slice(0, 40);
    setMeState(clean);
    try {
      localStorage.setItem(ME_KEY, clean);
    } catch {
      // Ignore storage errors.
    }
  }, []);
  return [me, setMe] as const;
}
