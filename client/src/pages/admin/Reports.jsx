import { useState } from "react";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../api/axios.js";
import { downloadFile } from "../../utils/download.js";

const today = new Date().toISOString().slice(0, 10);
const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

const REPORTS = [
  { key: "membership", title: "Membership Report", icon: "bi-people", desc: "New, active, expired and cancelled memberships in the period." },
  { key: "revenue", title: "Revenue Report", icon: "bi-cash-stack", desc: "Approved payments and revenue totals grouped by day." },
  { key: "attendance", title: "Attendance Report", icon: "bi-calendar-check", desc: "Gym check-ins and scan outcomes in the period." },
];

export default function Reports() {
  const [range, setRange] = useState({ dateFrom: firstOfMonth, dateTo: today });
  const [busy, setBusy] = useState("");

  const run = async (key, format) => {
    setBusy(`${key}-${format}`);
    try {
      const params = new URLSearchParams({ format });
      if (range.dateFrom) params.set("dateFrom", range.dateFrom);
      if (range.dateTo) params.set("dateTo", range.dateTo);
      const ext = format === "excel" ? "xlsx" : "pdf";
      await downloadFile(`/reports/${key}?${params.toString()}`, `${key}-report.${ext}`);
      toast.success(`${key} report downloaded`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-3">Reports</h4>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">From</label>
            <input type="date" className="form-control" value={range.dateFrom} onChange={(e) => setRange({ ...range, dateFrom: e.target.value })} />
          </div>
          <div className="col-md-4">
            <label className="form-label">To</label>
            <input type="date" className="form-control" value={range.dateTo} onChange={(e) => setRange({ ...range, dateTo: e.target.value })} />
          </div>
          <div className="col-md-4 text-muted small">
            Pick a date range, then export any report below as Excel or PDF.
          </div>
        </div>
      </div>

      <div className="row g-3">
        {REPORTS.map((r) => (
          <div className="col-md-4" key={r.key}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center mb-2">
                  <i className={`bi ${r.icon} fs-3 text-warning me-2`} />
                  <h5 className="mb-0">{r.title}</h5>
                </div>
                <p className="text-muted small flex-grow-1">{r.desc}</p>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-success btn-sm flex-fill" disabled={busy === `${r.key}-excel`} onClick={() => run(r.key, "excel")}>
                    <i className="bi bi-file-earmark-excel me-1" />
                    {busy === `${r.key}-excel` ? "..." : "Excel"}
                  </button>
                  <button className="btn btn-outline-danger btn-sm flex-fill" disabled={busy === `${r.key}-pdf`} onClick={() => run(r.key, "pdf")}>
                    <i className="bi bi-file-earmark-pdf me-1" />
                    {busy === `${r.key}-pdf` ? "..." : "PDF"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
