import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const features = [
  { icon: "bi-qr-code", title: "QR Membership Pass", text: "Get a secure digital pass for fast gym entry." },
  { icon: "bi-tags", title: "Plans & Promos", text: "Daily, weekly and monthly passes with auto-applied discounts." },
  { icon: "bi-calendar-check", title: "Attendance Tracking", text: "Automatic check-in and check-out on every scan." },
  { icon: "bi-graph-up", title: "Analytics", text: "Revenue, membership and attendance insights for admins." },
];

export default function Landing() {
  const user = useSelector((s) => s.auth.user);
  if (user) {
    const to = user.role === "admin" ? "/admin" : user.role === "staff" ? "/scanner" : "/dashboard";
    return <Navigate to={to} replace />;
  }

  return (
    <div className="auth-wrapper" style={{ alignItems: "stretch" }}>
      <div className="container text-white py-5">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div className="d-flex align-items-center gap-2">
            <span className="brand-badge">
              <i className="bi bi-heart-pulse" />
            </span>
            <h4 className="mb-0 fw-bold">FitZone Gym</h4>
          </div>
          <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-outline-light btn-sm">
              Login
            </Link>
            <Link to="/register" className="btn btn-warning btn-sm">
              Join Now
            </Link>
          </div>
        </div>

        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <h1 className="display-4 fw-bold mb-3">Your Membership, Reimagined.</h1>
            <p className="lead text-white-50 mb-4">
              Register online, subscribe to a plan, pay securely, and walk in with a QR code. A complete
              gym membership information system.
            </p>
            <div className="d-flex gap-2">
              <Link to="/register" className="btn btn-warning btn-lg">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-outline-light btn-lg">
                Member Login
              </Link>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="row g-3">
              {features.map((f) => (
                <div className="col-sm-6" key={f.title}>
                  <div className="card h-100 bg-dark bg-opacity-50 border-0 text-white">
                    <div className="card-body">
                      <i className={`bi ${f.icon} fs-2 text-warning`} />
                      <h6 className="mt-2">{f.title}</h6>
                      <p className="small text-white-50 mb-0">{f.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
