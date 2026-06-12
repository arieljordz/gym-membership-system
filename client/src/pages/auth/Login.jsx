import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { loginUser } from "../../features/auth/authSlice.js";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((s) => s.auth.status);
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(res)) {
      const role = res.payload.role;
      toast.success("Welcome back!");
      navigate(role === "admin" ? "/admin" : role === "staff" ? "/scanner" : "/dashboard");
    } else {
      toast.error(res.payload || "Login failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card card shadow-lg border-0">
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <span className="brand-badge mb-2">
              <i className="bi bi-heart-pulse" />
            </span>
            <h4 className="fw-bold mb-0">Welcome Back</h4>
            <p className="text-muted small">Sign in to your account</p>
          </div>

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={onChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={onChange}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="d-flex justify-content-end mb-3">
              <Link to="/forgot-password" className="small">
                Forgot password?
              </Link>
            </div>
            <button className="btn btn-warning w-100 fw-semibold" disabled={status === "loading"}>
              {status === "loading" ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center small mt-3 mb-0">
            No account? <Link to="/register">Create one</Link>
          </p>

          <div className="alert alert-light border mt-4 mb-0 small">
            <strong>Demo accounts</strong>
            <div>Admin: arieljordz@gmail.com / Admin@12345</div>
            <div>Member: suenoariel@gmail.com / Member@123</div>
            <div>Staff: apsueno@gmail.com / Staff@12345</div>
          </div>
        </div>
      </div>
    </div>
  );
}
