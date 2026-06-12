import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/axios.js";
import StatCard from "../../components/StatCard.jsx";
import Loader from "../../components/Loader.jsx";
import QRCard from "../../components/QRCard.jsx";
import { formatDate, daysLeft, formatDateTime, titleCase } from "../../utils/format.js";

export default function MemberDashboard() {
  const user = useSelector((s) => s.auth.user);
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState({ subscription: null, qrPass: null });
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [m, a] = await Promise.all([
          api.get("/subscriptions/membership"),
          api.get("/attendance/mine"),
        ]);
        setMembership(m.data.data);
        setAttendance(a.data.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader />;
  const sub = membership.subscription;
  const visits = attendance.filter((a) => a.scanResult === "granted").length;

  return (
    <div>
      <h4 className="fw-bold mb-1">Hi, {user?.firstName} ! </h4>
      <p className="text-muted">Here is your membership overview.</p>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard icon="bi-patch-check" label="Status" value={sub ? "Active" : "None"} color={sub ? "success" : "secondary"} />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon="bi-hourglass-split" label="Days Left" value={sub ? daysLeft(sub.endDate) : 0} color="warning" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon="bi-calendar-event" label="Expires" value={sub ? formatDate(sub.endDate) : "-"} color="info" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon="bi-door-open" label="Total Visits" value={visits} color="primary" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          {sub ? (
            <QRCard qrPass={membership.qrPass} subscription={sub} user={user} />
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-qr-code display-4 text-muted" />
                <h6 className="mt-3">No active membership</h6>
                <p className="text-muted small">Subscribe to a plan to get your QR pass.</p>
                <Link to="/plans" className="btn btn-warning">
                  Browse Plans
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent fw-semibold">Recent Attendance</div>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.slice(0, 8).map((a) => (
                    <tr key={a._id}>
                      <td>{formatDate(a.date)}</td>
                      <td>{a.timeIn ? new Date(a.timeIn).toLocaleTimeString() : "-"}</td>
                      <td>{a.timeOut ? new Date(a.timeOut).toLocaleTimeString() : "-"}</td>
                      <td>
                        <span className="badge bg-light text-dark">{titleCase(a.scanResult)}</span>
                      </td>
                    </tr>
                  ))}
                  {attendance.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">
                        No attendance yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
