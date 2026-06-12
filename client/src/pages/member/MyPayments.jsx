import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import { peso, formatDateTime, titleCase } from "../../utils/format.js";
import { STATUS_BADGE } from "../../utils/constants.js";

export default function MyPayments() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/payments/mine");
        setPayments(res.data.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h4 className="fw-bold mb-3">My Payment History</h4>
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Proof</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td>{formatDateTime(p.createdAt)}</td>
                  <td>{p.subscription?.plan?.name || "-"}</td>
                  <td>{peso(p.amount)}</td>
                  <td>{titleCase(p.method)}</td>
                  <td>{p.referenceNumber || "-"}</td>
                  <td>
                    <span className={`badge bg-${STATUS_BADGE[p.status] || "secondary"}`}>{titleCase(p.status)}</span>
                  </td>
                  <td>
                    {p.proofImage ? (
                      <a href={p.proofImage} target="_blank" rel="noreferrer">
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No payments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
