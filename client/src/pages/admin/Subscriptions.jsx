import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Pagination from "../../components/Pagination.jsx";
import { peso, formatDate, titleCase } from "../../utils/format.js";
import { STATUS_BADGE } from "../../utils/constants.js";

export default function Subscriptions() {
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (status) params.set("status", status);
      const { data } = await api.get(`/subscriptions?${params.toString()}`);
      setSubs(data.data);
      setMeta(data.meta);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">Subscriptions</h4>
        <div className="btn-group">
          {["", "pending", "active", "expired", "cancelled"].map((s) => (
            <button key={s || "all"} className={`btn btn-sm ${status === s ? "btn-warning" : "btn-outline-secondary"}`} onClick={() => { setPage(1); setStatus(s); }}>
              {s ? titleCase(s) : "All"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s._id}>
                    <td className="fw-semibold">
                      {s.member?.firstName} {s.member?.lastName}
                      <div className="small text-muted">{s.member?.email}</div>
                    </td>
                    <td>{s.plan?.name || "-"}</td>
                    <td>{peso(s.finalPrice)}</td>
                    <td className="small">{s.startDate ? formatDate(s.startDate) : "-"}</td>
                    <td className="small">{s.endDate ? formatDate(s.endDate) : "-"}</td>
                    <td>
                      <span className={`badge bg-${STATUS_BADGE[s.status] || "secondary"}`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
                {subs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      No subscriptions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
    </div>
  );
}
