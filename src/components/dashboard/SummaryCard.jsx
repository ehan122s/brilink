export function SummaryCard({ title, value, delta, tone, accent }) {
  return (
    <article className={`summary-card summary-card-${tone}`}>
      <div className="summary-card-head">
        <p>{title}</p>
        <span className="summary-chip">{delta}</span>
      </div>
      <strong>{value}</strong>
      <span className="summary-accent">{accent}</span>
    </article>
  );
}
