import { useEffect, useRef, useState } from "react";
import type { AppConfig, Field, Item } from "./types";
import { defaultValues, toLocalInput, validate } from "./utils";

interface Props {
  config: AppConfig;
  editing: Item | null;
  onSave: (values: Record<string, unknown>) => void;
  onClose: () => void;
}

/** Form fields hold strings while typing. They are converted to real types on submit. */
function initialDraft(config: AppConfig, editing: Item | null): Record<string, string> {
  const base = { ...defaultValues(config.fields), ...(editing?.values ?? {}) };
  const draft: Record<string, string> = {};
  for (const f of config.fields) {
    const v = base[f.key];
    if (f.type === "people" || f.hideInForm) continue;
    if (f.type === "datetime") draft[f.key] = typeof v === "number" ? toLocalInput(v) : "";
    else draft[f.key] = v === undefined || v === null ? "" : String(v);
  }
  return draft;
}

function convert(field: Field, raw: string): unknown {
  const text = raw.trim();
  if (text === "") return undefined;
  if (field.type === "number") return Number(text);
  if (field.type === "datetime") return new Date(text).getTime();
  return field.type === "select" ? raw : text;
}

export function ItemForm({ config, editing, onSave, onClose }: Props) {
  const [draft, setDraft] = useState(() => initialDraft(config, editing));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstRef = useRef<HTMLInputElement>(null);
  const formFields = config.fields.filter((f) => !f.hideInForm && f.type !== "people");

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const values: Record<string, unknown> = { ...defaultValues(config.fields), ...(editing?.values ?? {}) };
    for (const f of formFields) {
      const v = convert(f, draft[f.key] ?? "");
      if (v === undefined) delete values[f.key];
      else values[f.key] = v;
    }
    const found = validate(config.fields, values);
    setErrors(found);
    if (Object.keys(found).length === 0) onSave(values);
  }

  return (
    <div className="cs-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="cs-modal" onSubmit={submit} noValidate role="dialog" aria-modal="true" aria-labelledby="cs-form-title">
        <h2 id="cs-form-title">
          {editing ? "Edit" : "New"} {config.itemName.singular.toLowerCase()}
        </h2>
        {formFields.map((f, i) => {
          const id = `cs-f-${f.key}`;
          const common = {
            id,
            value: draft[f.key] ?? "",
            "aria-invalid": errors[f.key] ? true : undefined,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
              setDraft((d) => ({ ...d, [f.key]: e.target.value })),
          };
          return (
            <div className="cs-field" key={f.key}>
              <label htmlFor={id}>
                {f.label}
                {f.required && <span aria-hidden="true"> *</span>}
              </label>
              {f.type === "longtext" ? (
                <textarea {...common} rows={3} placeholder={f.placeholder} />
              ) : f.type === "select" ? (
                <select {...common}>
                  {!f.required && <option value="">Not set</option>}
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  {...common}
                  ref={i === 0 ? firstRef : undefined}
                  type={f.type === "number" ? "number" : f.type === "datetime" ? "datetime-local" : "text"}
                  min={f.min}
                  max={f.max}
                  placeholder={f.placeholder}
                />
              )}
              {f.help && <small>{f.help}</small>}
              {errors[f.key] && (
                <p className="cs-error" role="alert">
                  {errors[f.key]}
                </p>
              )}
            </div>
          );
        })}
        <div className="cs-modal-actions">
          <button type="button" className="cs-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="cs-btn cs-primary">
            {editing ? "Save changes" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
