import type { Item } from "@campus/skeleton";

function ago(ms: number): string {
  const mins = Math.max(1, Math.round(ms / 60_000));
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.round(hours / 24)} days ago`;
}

/** A big luggage tag that always shows the newest open report, so the hero is never fake. */
export function TagArt({ items, now }: { items: Item[]; now: number }) {
  const open = items.filter((i) => i.values.status === "Open");
  const latest = [...open].sort((a, b) => b.createdAt - a.createdAt)[0];
  const when = typeof latest?.values.when === "number" ? latest.values.when : now;

  return (
    <div className="lf-tag" role="img" aria-label="The newest open report, written on a luggage tag">
      <svg className="lf-string" viewBox="0 0 120 110" aria-hidden="true">
        <path d="M60 0 C60 34 24 40 36 74 C44 96 76 96 84 74 C92 54 66 46 60 62" fill="none" stroke="#1c1812" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div className="lf-tag-edge">
        <div className="lf-tag-body">
          <div className="lf-tag-top">
            <span className="lf-no">No. {String(items.length).padStart(4, "0")}</span>
            {latest && <span className="lf-stamp">{String(latest.values.kind ?? "")}</span>}
          </div>
          {latest ? (
            <>
              <p className="lf-title">{String(latest.values.title ?? "")}</p>
              <p className="lf-line">{String(latest.values.location ?? "")}</p>
              <p className="lf-line">{ago(now - when)}</p>
            </>
          ) : (
            <p className="lf-title">The shelf is empty. Somebody should lose something.</p>
          )}
          <div className="lf-count">
            <b>{open.length}</b>
            <span>{open.length === 1 ? "thing is" : "things are"} waiting for an owner</span>
          </div>
        </div>
      </div>
    </div>
  );
}
