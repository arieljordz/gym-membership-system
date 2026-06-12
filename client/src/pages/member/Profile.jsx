import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../../api/axios.js";
import { updateUser } from "../../features/auth/authSlice.js";

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [form, setForm] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    gender: user.gender || "other",
    birthdate: user.birthdate ? String(user.birthdate).slice(0, 10) : "",
    contactNumber: user.contactNumber || "",
    address: user.address || "",
  });
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch("/users/me", form);
      dispatch(updateUser(data.data.user));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/users/change-password", pwd);
      toast.success(data.message);
      setPwd({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-3">Profile Settings</h4>
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent fw-semibold">Personal Information</div>
            <div className="card-body">
              <form onSubmit={saveProfile} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">First Name</label>
                  <input name="firstName" className="form-control" value={form.firstName} onChange={onChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Last Name</label>
                  <input name="lastName" className="form-control" value={form.lastName} onChange={onChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Gender</label>
                  <select name="gender" className="form-select" value={form.gender} onChange={onChange}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Birthdate</label>
                  <input type="date" name="birthdate" className="form-control" value={form.birthdate} onChange={onChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Contact Number</label>
                  <input name="contactNumber" className="form-control" value={form.contactNumber} onChange={onChange} />
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <input name="address" className="form-control" value={form.address} onChange={onChange} />
                </div>
                <div className="col-12">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={user.email} disabled />
                </div>
                <div className="col-12">
                  <button className="btn btn-warning" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent fw-semibold">Change Password</div>
            <div className="card-body">
              <form onSubmit={changePassword}>
                <div className="mb-3">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pwd.currentPassword}
                    onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pwd.newPassword}
                    onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>
                <button className="btn btn-outline-warning w-100">Update Password</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
