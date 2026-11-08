// A bar that fills from 0 to 100%. role="progressbar" lets screen readers announce it.
// tone picks the color: "done" (green) or "xp" (gold).
export default function Bar({ percent, label, tone = "done" }) {
  return (
    <div
      className={`bar bar-${tone}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div className="bar-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
