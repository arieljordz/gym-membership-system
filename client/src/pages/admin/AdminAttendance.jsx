import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Pagination from "../../components/Pagination.jsx";
import { formatDate, formatDateTime } from "../../utils/format.js";
import { SCAN_RESULT } from "../../utils/constants.js";
import { downloadFile } from "../../utils/download.js";

export default function AdminAttendance() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [filters, setFilters] = useState({ result: "", dateFrom: "", dateTo: "" });
  const [page, setPage] = useState(1);

  const buildParams = () => {
    const params = new URLSearchParams();
    if (filters.result) params.set("result", filters.result);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    return params;
  };

  const load = async () => {
    setLoading(true);
    try {
      const params = buildParams();
      params.set("page", page);
      params.set("limit", 12);
      const { data } = await api.get(`/attendance?${params.toString()}`);
      setLogs(data.data);
      setMeta(data.meta);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const exportAs = async (format) => {
    try {
      const params = buildParams();
      params.set("format", format);
      await downloadFile(`/attendance/export?${params.toString()}`, `attendance.${format === "excel" ? "xlsx" : "pdf"}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">Attendance Logs</h4>
        <div>
          <button className="btn btn-sm btn-outline-success me-2" onClick={() => exportAs("excel")}>
            <i className="bi bi-file-earmark-excel me-1" /> Excel
          </button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => exportAs("pdf")}>
            <i className="bi bi-file-earmark-pdf me-1" /> PDF
          </button>
        </div>
      </div>

      <form className="row g-2 mb-3" onSubmit={applyFilters}>
        <div className="col-md-3">
          <select className="form-select" value={filters.result} onChange={(e) => setFilters({ ...filters, result: e.target.value })}>
            <option value="">All Results</option>
            {Object.entries(SCAN_RESULT).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <input type="date" className="form-control" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
        </div>
        <div className="col-md-3">
          <input type="date" className="form-control" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
        </div>
        <div className="col-md-3 d-grid">
          <button className="btn btn-warning">Filter</button>
        </div>
      </form>

      {loading ? (
        <Loader />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Member</th>
                  <th>Date</th>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => {
                  const sr = SCAN_RESULT[l.scanResult] || SCAN_RESULT.not_found;
                  return (
                    <tr key={l._id}>
                      <td className="fw-semibold">
                        {l.member?.firstName} {l.member?.lastName}
                        <div className="small text-muted">{l.member?.email}</div>
                      </td>
                      <td>{formatDate(l.date)}</td>
                      <td className="small">{l.timeIn ? formatDateTime(l.timeIn) : "-"}</td>
                      <td className="small">{l.timeOut ? formatDateTime(l.timeOut) : "-"}</td>
                      <td>
                        <span className={`badge bg-${sr.color}`}>
                          <i className={`bi ${sr.icon} me-1`} />
                          {sr.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      No attendance records.
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
