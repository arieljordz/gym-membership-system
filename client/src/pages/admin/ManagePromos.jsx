import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import { formatDate } from "../../utils/format.js";

const today = new Date().toISOString().slice(0, 10);
const empty = { promoName: "", code: "", discountPercentage: 10, startDate: today, endDate: today, status: "active", description: "" };

export default function ManagePromos() {
  const [loading, setLoading] = useState(true);
  const [promos, setPromos] = useState([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await api.get("/promos?all=true");
    setPromos(data.data);
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
    setForm({
      promoName: p.promoName,
      code: p.code || "",
      discountPercentage: p.discountPercentage,
      startDate: String(p.startDate).slice(0, 10),
      endDate: String(p.endDate).slice(0, 10),
      status: p.status,
      description: p.description || "",
    });
    setShow(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...form, discountPercentage: Number(form.discountPercentage) };
    try {
      if (editing) await api.patch(`/promos/${editing._id}`, payload);
      else await api.post("/promos", payload);
      toast.success(`Promo ${editing ? "updated" : "created"}`);
      setShow(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggle = async (p) => {
    await api.patch(`/promos/${p._id}/toggle`);
    load();
  };
  const remove = async (p) => {
    if (!window.confirm(`Delete promo "${p.promoName}"?`)) return;
    try {
      await api.delete(`/promos/${p._id}`);
      toast.success("Promo deleted");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Promotions</h4>
        <button className="btn btn-warning" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1" /> Add Promo
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Discount</th>
                <th>Window</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="fw-semibold">{p.promoName}</div>
                    <small className="text-muted">{p.description}</small>
                  </td>
                  <td>{p.code || "-"}</td>
                  <td>{p.discountPercentage}%</td>
                  <td className="small">
                    {formatDate(p.startDate)} - {formatDate(p.endDate)}
                  </td>
                  <td>
                    <span className={`badge bg-${p.status === "active" ? "success" : "secondary"}`}>{p.status}</span>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => toggle(p)}>
                      <i className={`bi ${p.status === "active" ? "bi-toggle-on" : "bi-toggle-off"}`} />
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
                  <h5 className="modal-title">{editing ? "Edit Promo" : "Add Promo"}</h5>
                  <button type="button" className="btn-close" onClick={() => setShow(false)} />
                </div>
                <div className="modal-body row g-3">
                  <div className="col-md-8">
                    <label className="form-label">Promo Name</label>
                    <input className="form-control" value={form.promoName} onChange={(e) => setForm({ ...form, promoName: e.target.value })} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Code</label>
                    <input className="form-control" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Discount %</label>
                    <input type="number" min="0" max="100" className="form-control" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-control" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-control" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <input className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-warning">{editing ? "Save Changes" : "Create Promo"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
