interface Props {
  value: number;
  max: number;
  label: string;
}

/** A small progress bar. Apps can use it inside `renderExtra`. */
export function Meter({ value, max, label }: Props) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="cs-meter-wrap">
      <div className="cs-meter-label">
        <span>{label}</span>
        <b>
          {value}/{max}
        </b>
      </div>
      <div className="cs-meter" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
        <div style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
