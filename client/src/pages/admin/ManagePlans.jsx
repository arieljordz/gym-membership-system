import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import { peso } from "../../utils/format.js";

const empty = { name: "", type: "monthly", durationDays: 30, price: 0, description: "", features: "", isActive: true };

export default function ManagePlans() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await api.get("/plans?all=true");
    setPlans(data.data);
  };
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setShow(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...p, features: (p.features || []).join(", ") });
    setShow(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      durationDays: Number(form.durationDays),
      price: Number(form.price),
      features: form.features ? form.features.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };
    try {
      if (editing) await api.patch(`/plans/${editing._id}`, payload);
      else await api.post("/plans", payload);
      toast.success(`Plan ${editing ? "updated" : "created"}`);
      setShow(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggle = async (p) => {
    await api.patch(`/plans/${p._id}/toggle`);
    load();
  };
  const remove = async (p) => {
    if (!window.confirm(`Delete plan "${p.name}"?`)) return;
    try {
      await api.delete(`/plans/${p._id}`);
      toast.success("Plan deleted");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Membership Plans</h4>
        <button className="btn btn-warning" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1" /> Add Plan
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="fw-semibold">{p.name}</div>
                    <small className="text-muted">{p.description}</small>
                  </td>
                  <td className="text-capitalize">{p.type}</td>
                  <td>{p.durationDays} day(s)</td>
                  <td>{peso(p.price)}</td>
                  <td>
                    <span className={`badge bg-${p.isActive ? "success" : "secondary"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => toggle(p)} title="Toggle">
                      <i className={`bi ${p.isActive ? "bi-toggle-on" : "bi-toggle-off"}`} />
                    </button>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(p)}>
                      <i className="bi bi-pencil" />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(p)}>
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {show && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={save}>
                <div className="modal-header">
                  <h5 className="modal-title">{editing ? "Edit Plan" : "Add Plan"}</h5>
                  <button type="button" className="btn-close" onClick={() => setShow(false)} />
                </div>
                <div className="modal-body row g-3">
                  <div className="col-12">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Days</label>
                    <input type="number" min="1" className="form-control" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Price</label>
                    <input type="number" min="0" step="0.01" className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <input className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Features (comma-separated)</label>
                    <input className="form-control" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-warning">{editing ? "Save Changes" : "Create Plan"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
