import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Pagination from "../../components/Pagination.jsx";
import { formatDate } from "../../utils/format.js";

export default function Members() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [filters, setFilters] = useState({ search: "", role: "", status: "" });
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (filters.search) params.set("search", filters.search);
      if (filters.role) params.set("role", filters.role);
      if (filters.status) params.set("status", filters.status);
      const { data } = await api.get(`/users?${params.toString()}`);
      setUsers(data.data);
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

  const setRole = async (u, role) => {
    try {
      await api.patch(`/users/${u._id}`, { role });
      toast.success("Role updated");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };
  const toggleStatus = async (u) => {
    try {
      await api.patch(`/users/${u._id}`, { status: u.status === "active" ? "disabled" : "active" });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };
  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.firstName} ${u.lastName}?`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      toast.success("User deleted");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-3">Members & Users</h4>

      <form className="row g-2 mb-3" onSubmit={applyFilters}>
        <div className="col-md-4">
          <input className="form-control" placeholder="Search name or email" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
            <option value="">All Roles</option>
            <option value="member">Member</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        <div className="col-md-2 d-grid">
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="fw-semibold">
                      {u.firstName} {u.lastName}
                    </td>
                    <td>{u.email}</td>
                    <td style={{ width: 130 }}>
                      <select className="form-select form-select-sm" value={u.role} onChange={(e) => setRole(u, e.target.value)}>
                        <option value="member">member</option>
                        <option value="staff">staff</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge bg-${u.status === "active" ? "success" : "secondary"}`}>{u.status}</span>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => toggleStatus(u)}>
                        {u.status === "active" ? "Disable" : "Enable"}
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => remove(u)}>
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      No users found.
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
