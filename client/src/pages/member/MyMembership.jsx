import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import QRCard from "../../components/QRCard.jsx";
import { peso, formatDate } from "../../utils/format.js";

export default function MyMembership() {
  const user = useSelector((s) => s.auth.user);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ subscription: null, qrPass: null });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/subscriptions/membership");
        setData(res.data.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader />;
  const sub = data.subscription;

  if (!sub) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <i className="bi bi-qr-code display-4 text-muted" />
          <h5 className="mt-3">No Active Membership</h5>
          <p className="text-muted">Subscribe to a plan to receive your QR membership pass.</p>
          <Link to="/plans" className="btn btn-warning">
            Browse Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="fw-bold mb-3">My QR Membership Pass</h4>
      <div className="row g-4">
        <div className="col-md-6 col-lg-5">
          <QRCard qrPass={data.qrPass} subscription={sub} user={user} />
        </div>
        <div className="col-md-6 col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent fw-semibold">Subscription Details</div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex justify-content-between">
                <span className="text-muted">Plan</span>
                <strong>{sub.plan?.name}</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span className="text-muted">Amount Paid</span>
                <strong>{peso(sub.finalPrice)}</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span className="text-muted">Start Date</span>
                <span>{formatDate(sub.startDate)}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span className="text-muted">End Date</span>
                <span>{formatDate(sub.endDate)}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span className="text-muted">Status</span>
                <span className="badge bg-success text-uppercase">{sub.status}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
