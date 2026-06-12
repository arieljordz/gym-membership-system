import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios.js";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const email = params.get("email") || "";
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token || !email) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }
      try {
        const { data } = await api.post("/auth/verify-email", { token, email });
        setStatus("success");
        setMessage(data.message);
      } catch (err) {
        setStatus("error");
        setMessage(getErrorMessage(err));
      }
    };
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="auth-wrapper">
      <div className="auth-card card shadow-lg border-0">
        <div className="card-body p-4 p-md-5 text-center">
          {status === "verifying" && (
            <>
              <div className="spinner-border text-warning mb-3" role="status" />
              <p>Verifying your email...</p>
            </>
          )}
          {status === "success" && (
            <>
              <i className="bi bi-check-circle-fill text-success display-4" />
              <h5 className="mt-2">Email Verified</h5>
              <p className="text-muted small">{message}</p>
              <Link to="/login" className="btn btn-warning">
                Continue to Login
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <i className="bi bi-x-circle-fill text-danger display-4" />
              <h5 className="mt-2">Verification Failed</h5>
              <p className="text-muted small">{message}</p>
              <Link to="/login" className="btn btn-outline-secondary">
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
