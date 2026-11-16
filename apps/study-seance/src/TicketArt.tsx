import type { Item } from "@campus/skeleton";

function members(item: Item): string[] {
  return Array.isArray(item.values.members) ? item.values.members.map(String) : [];
}

function fmt(ts: unknown): string {
  return typeof ts === "number"
    ? new Date(ts).toLocaleString(undefined, { weekday: "long", hour: "numeric", minute: "2-digit" })
    : "";
}

/** An admit-one ticket for the next session that still has a free seat. Real data, not a mock. */
export function TicketArt({ items, now }: { items: Item[]; now: number }) {
  const upcoming = items
    .filter((i) => typeof i.values.when === "number" && (i.values.when as number) > now)
    .sort((a, b) => (a.values.when as number) - (b.values.when as number));
  const next = upcoming.find((i) => members(i).length < Number(i.values.capacity ?? 0)) ?? upcoming[0];

  if (!next) {
    return (
      <div className="ss-ticket" role="img" aria-label="No upcoming sessions">
        <div className="ss-main">
          <span className="ss-admit">Admit one</span>
          <p className="ss-topic">No table is set yet. Host the first one.</p>
        </div>
      </div>
    );
  }

  const cap = Number(next.values.capacity ?? 0);
  const taken = members(next).length;

  return (
    <div className="ss-ticket" role="img" aria-label={`Next session: ${String(next.values.topic)}, ${taken} of ${cap} seats taken`}>
      <div className="ss-main">
        <span className="ss-admit">Admit one &middot; {String(next.values.course ?? "")}</span>
        <p className="ss-topic">{String(next.values.topic ?? "")}</p>
        <dl>
          <div>
            <dt>When</dt>
            <dd>{fmt(next.values.when)}</dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd>{String(next.values.place ?? "")}</dd>
          </div>
          <div>
            <dt>Pace</dt>
            <dd>{String(next.values.level ?? "")}</dd>
          </div>
        </dl>
      </div>
      <div className="ss-stub">
        <span>Seats</span>
        <b>
          {taken}/{cap}
        </b>
        <div className="ss-dots" aria-hidden="true">
          {Array.from({ length: cap }, (_, i) => (
            <i key={i} className={i < taken ? "on" : ""} />
          ))}
        </div>
      </div>
    </div>
  );
}
