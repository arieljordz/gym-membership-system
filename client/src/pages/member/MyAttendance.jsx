import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import { formatDate, titleCase } from "../../utils/format.js";

export default function MyAttendance() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/attendance/mine");
        setLogs(res.data.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h4 className="fw-bold mb-3">My Attendance History</h4>
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((a) => (
                <tr key={a._id}>
                  <td>{formatDate(a.date)}</td>
                  <td>{a.timeIn ? new Date(a.timeIn).toLocaleTimeString() : "-"}</td>
                  <td>{a.timeOut ? new Date(a.timeOut).toLocaleTimeString() : "-"}</td>
                  <td>
                    <span className={`badge ${a.scanResult === "granted" ? "bg-success" : "bg-secondary"}`}>
                      {titleCase(a.scanResult)}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    No attendance records yet.
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
