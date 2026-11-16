import type { AppConfig, Field, Item, ItemAction } from "./types";
import { formatValue, titleOf } from "./utils";

interface Props {
  config: AppConfig;
  item: Item;
  me: string;
  now: number;
  /** When true the card shows every field. Used by the detail view. */
  expanded?: boolean;
  onOpen?: () => void;
  onAction: (action: ItemAction, item: Item) => void;
}

export function visibleActions(config: AppConfig, item: Item, me: string, now: number): ItemAction[] {
  return (config.actions ?? []).filter((a) => !a.visible || a.visible(item, { me, now }));
}

export function ItemBody({ config, item, now, expanded }: Pick<Props, "config" | "item" | "now" | "expanded">) {
  const pills = (config.pills ?? []).map((k) => config.fields.find((f) => f.key === k)).filter((f): f is Field => !!f);
  const metaFields = config.fields.filter(
    (f) =>
      f.key !== config.titleField &&
      !(config.pills ?? []).includes(f.key) &&
      (expanded || (!f.hideInCard && f.type !== "longtext")) &&
      formatValue(f, item.values[f.key]) !== "",
  );
  const summary = config.summaryField ? String(item.values[config.summaryField] ?? "") : "";
  const status = config.status?.of(item, now);
  return (
    <>
      <div className="cs-pills">
        {status && <span className={`cs-badge cs-tone-${config.status?.options[status] ?? "muted"}`}>{status}</span>}
        {pills.map((f) => (
          <span key={f.key} className="cs-pill">
            {formatValue(f, item.values[f.key])}
          </span>
        ))}
      </div>
      <h3>{titleOf(config, item)}</h3>
      {!expanded && summary && <p className="cs-summary">{summary}</p>}
      <dl className="cs-meta">
        {metaFields.map((f) => (
          <div key={f.key}>
            <dt>{f.label}</dt>
            <dd>{formatValue(f, item.values[f.key])}</dd>
          </div>
        ))}
      </dl>
      {config.renderExtra?.(item, now)}
    </>
  );
}

export function ItemCard({ config, item, me, now, onOpen, onAction }: Props) {
  const actions = visibleActions(config, item, me, now);
  return (
    <article className="cs-card">
      <button type="button" className="cs-card-main" onClick={onOpen} aria-label={`Open ${config.itemName.singular}`}>
        <ItemBody config={config} item={item} now={now} />
      </button>
      <div className="cs-card-foot">
        <small>
          by {item.createdBy === me ? "you" : item.createdBy}
        </small>
        <div className="cs-actions">
          {actions.map((a) => (
            <button key={a.id} type="button" className={`cs-btn cs-small ${a.tone === "primary" ? "cs-primary" : a.tone === "danger" ? "cs-danger" : ""}`} onClick={() => onAction(a, item)}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
