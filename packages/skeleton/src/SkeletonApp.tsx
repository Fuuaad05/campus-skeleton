import { useEffect, useMemo, useRef, useState } from "react";
import type { AppConfig, Item, ItemAction } from "./types";
import { useCollection, useMe } from "./store";
import { filterChoices, matchesQuery, parseItems } from "./utils";
import { ItemBody, ItemCard, visibleActions } from "./ItemCard";
import { ItemForm } from "./ItemForm";
import "./styles.css";

const ALIASES = ["Wandering Wraith", "Sleepy Specter", "Curious Poltergeist", "Friendly Banshee", "Library Ghoul", "Midnight Mummy"];

function randomAlias() {
  return `${ALIASES[Math.floor(Math.random() * ALIASES.length)]} ${Math.floor(Math.random() * 90 + 10)}`;
}

function useNow(ms = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

function download(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function SkeletonApp({ config }: { config: AppConfig }) {
  const [me, setMe] = useMe();
  const { items, add, update, patch, remove, replaceAll } = useCollection(config);
  const now = useNow();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState<{ editing: Item | null } | null>(null);
  const [toast, setToast] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = `${config.name} | ${config.tagline}`;
  }, [config]);

  function say(message: string) {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(""), 4500);
  }

  const filterFields = config.fields.filter((f) => f.filterable && (f.type === "select" || f.type === "text"));
  const dateFields = config.fields.filter((f) => f.type === "datetime");

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!config.status) return counts;
    for (const i of items) {
      const s = config.status.of(i, now);
      counts[s] = (counts[s] ?? 0) + 1;
    }
    return counts;
  }, [items, config, now]);

  const visible = useMemo(() => {
    const list = items.filter((i) => {
      if (!matchesQuery(config, i, query)) return false;
      if (statusFilter !== "all" && config.status?.of(i, now) !== statusFilter) return false;
      for (const [key, val] of Object.entries(filters)) {
        if (val && val !== "all" && String(i.values[key] ?? "") !== val) return false;
      }
      return true;
    });
    if (sort.startsWith("date:")) {
      const key = sort.slice(5);
      const at = (i: Item) => (typeof i.values[key] === "number" ? (i.values[key] as number) : Infinity);
      list.sort((a, b) => at(a) - at(b));
    } else {
      list.sort((a, b) => b.createdAt - a.createdAt);
    }
    return list;
  }, [items, config, query, filters, statusFilter, sort, now]);

  const open = items.find((i) => i.id === openId) ?? null;

  function runAction(action: ItemAction, item: Item) {
    patch(item.id, action.run(item, { me, now: Date.now() }));
    if (action.toast) say(action.toast);
  }

  function save(values: Record<string, unknown>) {
    if (form?.editing) {
      update(form.editing.id, values);
      say(`${config.itemName.singular} updated.`);
    } else {
      add(config.beforeCreate ? config.beforeCreate(values, me) : values, me);
      say(`${config.itemName.singular} created.`);
    }
    setForm(null);
  }

  function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    file
      .text()
      .then((text) => {
        const parsed = parseItems(JSON.parse(text));
        if (!parsed) throw new Error("bad shape");
        replaceAll(parsed);
        say(`Imported ${parsed.length} ${config.itemName.plural.toLowerCase()}.`);
      })
      .catch(() => say("That file is not a valid backup."));
    setMenuOpen(false);
  }

  const theme = config.theme;
  const style = {
    "--accent": theme.accent,
    "--accent-text": theme.accentText ?? "#ffffff",
    "--accent-2": theme.accent2 ?? theme.accent,
  } as React.CSSProperties;

  const needsName = !me || renaming;

  return (
    <div className="cs-root" data-theme={theme.mode} style={style}>
      <header className="cs-header">
        <div className="cs-brand">
          <span className="cs-emoji" aria-hidden="true">
            {config.emoji}
          </span>
          <div>
            <h1>{config.name}</h1>
            <p>{config.tagline}</p>
          </div>
        </div>
        <div className="cs-header-actions">
          {me && (
            <button type="button" className="cs-btn cs-ghost" onClick={() => setRenaming(true)} title="Change your name">
              {me}
            </button>
          )}
          <div className="cs-menu">
            <button type="button" className="cs-btn" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
              Data
            </button>
            {menuOpen && (
              <div className="cs-menu-pop">
                <button
                  type="button"
                  onClick={() => {
                    download(`${config.id}-backup.json`, JSON.stringify({ items }, null, 2));
                    setMenuOpen(false);
                  }}
                >
                  Export backup
                </button>
                <button type="button" onClick={() => fileRef.current?.click()}>
                  Import backup
                </button>
                <button
                  type="button"
                  className="cs-danger-text"
                  onClick={() => {
                    if (window.confirm(`Delete every ${config.itemName.singular.toLowerCase()}? This cannot be undone.`)) {
                      replaceAll([]);
                      say("Everything was deleted.");
                    }
                    setMenuOpen(false);
                  }}
                >
                  Delete everything
                </button>
                <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
              </div>
            )}
          </div>
          <button type="button" className="cs-btn cs-primary" onClick={() => setForm({ editing: null })} disabled={!me}>
            New {config.itemName.singular.toLowerCase()}
          </button>
        </div>
      </header>

      <section className="cs-toolbar" aria-label="Search and filters">
        <input
          type="search"
          className="cs-search"
          placeholder={`Search ${config.itemName.plural.toLowerCase()}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search"
        />
        {filterFields.map((f) => (
          <select
            key={f.key}
            aria-label={`Filter by ${f.label}`}
            value={filters[f.key] ?? "all"}
            onChange={(e) => setFilters((p) => ({ ...p, [f.key]: e.target.value }))}
          >
            <option value="all">Any {f.label.toLowerCase()}</option>
            {filterChoices(f, items).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ))}
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest first</option>
          {dateFields.map((f) => (
            <option key={f.key} value={`date:${f.key}`}>
              Soonest {f.label.toLowerCase()}
            </option>
          ))}
        </select>
      </section>

      {config.status && (
        <div className="cs-chips" role="group" aria-label="Status">
          <button type="button" className={`cs-chip ${statusFilter === "all" ? "on" : ""}`} onClick={() => setStatusFilter("all")}>
            All <b>{items.length}</b>
          </button>
          {Object.keys(config.status.options).map((s) => (
            <button
              key={s}
              type="button"
              className={`cs-chip ${statusFilter === s ? "on" : ""}`}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
            >
              {s} <b>{statusCounts[s] ?? 0}</b>
            </button>
          ))}
        </div>
      )}

      <main>
        {visible.length === 0 ? (
          <div className="cs-empty">
            <span aria-hidden="true">{config.emoji}</span>
            <h2>{items.length === 0 ? `No ${config.itemName.plural.toLowerCase()} yet` : "Nothing matches"}</h2>
            <p>
              {items.length === 0
                ? `Be the first to add one.`
                : "Try a different search or clear the filters."}
            </p>
            {items.length > 0 && (
              <button
                type="button"
                className="cs-btn"
                onClick={() => {
                  setQuery("");
                  setFilters({});
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="cs-grid">
            {visible.map((item) => (
              <ItemCard
                key={item.id}
                config={config}
                item={item}
                me={me}
                now={now}
                onOpen={() => setOpenId(item.id)}
                onAction={runAction}
              />
            ))}
          </div>
        )}
      </main>

      {open && (
        <div className="cs-overlay" onMouseDown={(e) => e.target === e.currentTarget && setOpenId(null)}>
          <div className="cs-modal cs-detail" role="dialog" aria-modal="true">
            <button type="button" className="cs-x" onClick={() => setOpenId(null)} aria-label="Close">
              ×
            </button>
            <ItemBody config={config} item={open} now={now} expanded />
            <p className="cs-by">
              Posted by {open.createdBy === me ? "you" : open.createdBy} on {new Date(open.createdAt).toLocaleDateString()}
            </p>
            <div className="cs-modal-actions">
              {visibleActions(config, open, me, now).map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`cs-btn ${a.tone === "primary" ? "cs-primary" : a.tone === "danger" ? "cs-danger" : ""}`}
                  onClick={() => runAction(a, open)}
                >
                  {a.label}
                </button>
              ))}
              {open.createdBy === me && (
                <>
                  <button
                    type="button"
                    className="cs-btn"
                    onClick={() => {
                      setForm({ editing: open });
                      setOpenId(null);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="cs-btn cs-danger"
                    onClick={() => {
                      if (window.confirm("Delete this for good?")) {
                        remove(open.id);
                        setOpenId(null);
                        say("Deleted.");
                      }
                    }}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {form && <ItemForm config={config} editing={form.editing} onSave={save} onClose={() => setForm(null)} />}

      {needsName && (
        <NamePrompt
          initial={me}
          appName={config.name}
          onDone={(name) => {
            setMe(name);
            setRenaming(false);
          }}
          onCancel={me ? () => setRenaming(false) : undefined}
        />
      )}

      {toast && (
        <div className="cs-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

function NamePrompt({
  initial,
  appName,
  onDone,
  onCancel,
}: {
  initial: string;
  appName: string;
  onDone: (name: string) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial || randomAlias());
  return (
    <div className="cs-overlay">
      <form
        className="cs-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cs-name-title"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onDone(name);
        }}
      >
        <h2 id="cs-name-title">Welcome to {appName}</h2>
        <p className="cs-hint">Pick a name other students will see. It is stored only in this browser.</p>
        <div className="cs-field">
          <label htmlFor="cs-name">Your name</label>
          <input id="cs-name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div className="cs-modal-actions">
          {onCancel && (
            <button type="button" className="cs-btn" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button type="submit" className="cs-btn cs-primary" disabled={!name.trim()}>
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
