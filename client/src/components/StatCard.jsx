export default function StatCard({ icon, label, value, color = "warning", sub }) {
  return (
    <div className="card stat-card shadow-sm h-100">
      <div className="card-body d-flex align-items-center gap-3">
        <div className={`icon bg-${color} bg-opacity-25 text-${color}`}>
          <i className={`bi ${icon}`} />
        </div>
        <div>
          <div className="text-muted small text-uppercase" style={{ letterSpacing: 0.5 }}>
            {label}
          </div>
          <div className="h4 mb-0 fw-bold">{value}</div>
          {sub && <div className="small text-muted">{sub}</div>}
        </div>
      </div>
    </div>
  );
}
