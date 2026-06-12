import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Pagination from "../../components/Pagination.jsx";
import { peso, formatDateTime, titleCase } from "../../utils/format.js";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "/api").replace(/\/api\/?$/, "");

export default function AdminPayments() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [proof, setProof] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (status) params.set("status", status);
      const { data } = await api.get(`/payments?${params.toString()}`);
      setPayments(data.data);
      setMeta(data.meta);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const approve = async (p) => {
    try {
      await api.patch(`/payments/${p._id}/approve`);
      toast.success("Payment approved & membership activated");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };
  const reject = async (p) => {
    const reason = window.prompt("Reason for rejection?", "Invalid proof of payment");
    if (reason === null) return;
    try {
      await api.patch(`/payments/${p._id}/reject`, { reason });
      toast.info("Payment rejected");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const proofSrc = (img) => (img?.startsWith("http") ? img : `${API_ORIGIN}${img}`);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">Payments</h4>
        <div className="btn-group">
          {["pending", "approved", "rejected", ""].map((s) => (
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
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td className="fw-semibold">
                      {p.member?.firstName} {p.member?.lastName}
                      <div className="small text-muted">{p.member?.email}</div>
                    </td>
                    <td>{p.subscription?.plan?.name || "-"}</td>
                    <td>{peso(p.amount)}</td>
                    <td className="text-uppercase small">{p.method}</td>
                    <td className="small">{p.referenceNumber || "-"}</td>
                    <td className="small">{formatDateTime(p.createdAt)}</td>
                    <td>
                      <span className={`badge bg-${p.status === "approved" ? "success" : p.status === "rejected" ? "danger" : "warning text-dark"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-end" style={{ minWidth: 200 }}>
                      {p.proofImage && (
                        <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setProof(proofSrc(p.proofImage))}>
                          <i className="bi bi-image" />
                        </button>
                      )}
                      {p.status === "pending" && (
                        <>
                          <button className="btn btn-sm btn-success me-1" onClick={() => approve(p)}>
                            Approve
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => reject(p)}>
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />

      {proof && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.7)" }} onClick={() => setProof(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Proof of Payment</h5>
                <button type="button" className="btn-close" onClick={() => setProof(null)} />
              </div>
              <div className="modal-body text-center">
                <img src={proof} alt="proof" className="img-fluid rounded" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
