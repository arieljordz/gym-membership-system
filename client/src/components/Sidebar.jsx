import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const memberLinks = [
  { to: "/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
  { to: "/plans", icon: "bi-card-checklist", label: "Plans & Promos" },
  { to: "/membership", icon: "bi-qr-code", label: "My QR Pass" },
  { to: "/attendance", icon: "bi-calendar-check", label: "My Attendance" },
  { to: "/payments", icon: "bi-receipt", label: "My Payments" },
];

const adminLinks = [
  { to: "/admin", icon: "bi-speedometer2", label: "Dashboard" },
  { to: "/admin/members", icon: "bi-people", label: "Members" },
  { to: "/admin/plans", icon: "bi-card-checklist", label: "Plans" },
  { to: "/admin/promos", icon: "bi-tags", label: "Promotions" },
  { to: "/admin/subscriptions", icon: "bi-arrow-repeat", label: "Subscriptions" },
  { to: "/admin/payments", icon: "bi-cash-coin", label: "Payments" },
  { to: "/admin/attendance", icon: "bi-calendar-check", label: "Attendance" },
  { to: "/admin/reports", icon: "bi-graph-up", label: "Reports" },
  { to: "/scanner", icon: "bi-upc-scan", label: "QR Scanner" },
];

const staffLinks = [{ to: "/scanner", icon: "bi-upc-scan", label: "QR Scanner" }];

export default function Sidebar({ open, onNavigate }) {
  const user = useSelector((s) => s.auth.user);
  let links = memberLinks;
  if (user?.role === "admin") links = adminLinks;
  else if (user?.role === "staff") links = staffLinks;

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="d-flex align-items-center gap-2 px-3 py-3 border-bottom border-secondary border-opacity-25">
        <span className="brand-badge" style={{ width: 40, height: 40, fontSize: "1.1rem" }}>
          <i className="bi bi-heart-pulse" />
        </span>
        <div>
          <div className="fw-bold text-white">FitZone Gym</div>
          <small className="text-uppercase text-secondary" style={{ fontSize: "0.65rem", letterSpacing: 1 }}>
            {user?.role} portal
          </small>
        </div>
      </div>
      <nav className="py-2">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end onClick={onNavigate} className={({ isActive }) => (isActive ? "active" : "")}>
            <i className={`bi ${l.icon}`} />
            <span>{l.label}</span>
          </NavLink>
        ))}
        <NavLink to="/profile" onClick={onNavigate} className={({ isActive }) => (isActive ? "active" : "")}>
          <i className="bi bi-person-gear" />
          <span>Profile</span>
        </NavLink>
      </nav>
    </aside>
  );
}
