import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { registerUser } from "../../features/auth/authSlice.js";

const initial = {
  firstName: "",
  lastName: "",
  gender: "male",
  birthdate: "",
  contactNumber: "",
  email: "",
  address: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const { confirmPassword, ...payload } = form;
    const res = await dispatch(registerUser(payload));
    setLoading(false);
    if (registerUser.fulfilled.match(res)) {
      toast.success(res.payload.message || "Registration successful");
      if (res.payload.data?.verifyUrl) {
        toast.info("Dev mode: check server console / link to verify email.");
      }
      navigate("/login");
    } else {
      toast.error(res.payload || "Registration failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card shadow-lg border-0" style={{ width: "100%", maxWidth: 640 }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <span className="brand-badge mb-2">
              <i className="bi bi-person-plus" />
            </span>
            <h4 className="fw-bold mb-0">Create Your Account</h4>
            <p className="text-muted small">Join FitZone Gym today</p>
          </div>

          <form onSubmit={submit}>
            <div className="row g-3">
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
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-control" value={form.email} onChange={onChange} required />
              </div>
              <div className="col-12">
                <label className="form-label">Address</label>
                <input name="address" className="form-control" value={form.address} onChange={onChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Password</label>
                <input type="password" name="password" className="form-control" value={form.password} onChange={onChange} required minLength={8} />
                <div className="form-text">Min 8 chars, with a letter and a number.</div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Confirm Password</label>
                <input type="password" name="confirmPassword" className="form-control" value={form.confirmPassword} onChange={onChange} required />
              </div>
            </div>

            <button className="btn btn-warning w-100 fw-semibold mt-4" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="text-center small mt-3 mb-0">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
