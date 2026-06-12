import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import StatCard from "../../components/StatCard.jsx";
import { peso } from "../../utils/format.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/dashboard/admin");
        setData(r.data.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !data) return <Loader />;

  const revenueTrend = {
    labels: data.charts.revenueTrend.map((d) => d.date),
    datasets: [
      {
        label: "Revenue",
        data: data.charts.revenueTrend.map((d) => d.total),
        borderColor: "#fb5607",
        backgroundColor: "rgba(251,86,7,.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };
  const attendanceTrend = {
    labels: data.charts.attendanceTrend.map((d) => d.date),
    datasets: [{ label: "Check-ins", data: data.charts.attendanceTrend.map((d) => d.count), backgroundColor: "#ff9e00" }],
  };
  const planDist = {
    labels: data.charts.planDistribution.map((p) => p.name),
    datasets: [
      {
        data: data.charts.planDistribution.map((p) => p.count),
        backgroundColor: ["#fb5607", "#ff9e00", "#8338ec", "#3a86ff", "#06d6a0"],
      },
    ],
  };

  return (
    <div>
      <h4 className="fw-bold mb-3">Admin Dashboard</h4>

      <div className="row g-3 mb-2">
        <div className="col-sm-6 col-xl-3">
          <StatCard icon="bi-people-fill" label="Total Members" value={data.members.total} color="primary" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon="bi-person-check-fill" label="Active Members" value={data.members.active} color="success" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon="bi-person-dash-fill" label="Expired" value={data.members.expired} color="secondary" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon="bi-person-plus-fill" label="New (7 days)" value={data.members.newThisWeek} color="info" />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard icon="bi-cash-stack" label="Revenue Today" value={peso(data.revenue.daily)} color="warning" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon="bi-graph-up-arrow" label="Revenue (Week)" value={peso(data.revenue.weekly)} color="warning" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon="bi-calendar-month" label="Revenue (Month)" value={peso(data.revenue.monthly)} color="warning" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon="bi-door-open-fill" label="Today's Attendance" value={data.attendance.today} color="danger" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent fw-semibold">Revenue (Last 7 Days)</div>
            <div className="card-body">
              <Line data={revenueTrend} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent fw-semibold">Active Plan Distribution</div>
            <div className="card-body d-flex align-items-center justify-content-center">
              {planDist.labels.length ? (
                <Pie data={planDist} />
              ) : (
                <p className="text-muted">No active subscriptions yet.</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent fw-semibold">Attendance (Last 7 Days)</div>
            <div className="card-body">
              <Bar data={attendanceTrend} options={{ responsive: true, plugins: { legend: { display: false } } }} height={80} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
