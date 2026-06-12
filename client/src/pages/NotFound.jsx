import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="auth-wrapper">
      <div className="text-center text-white">
        <h1 className="display-1 fw-bold">404</h1>
        <p className="lead">Page not found.</p>
        <Link to="/" className="btn btn-warning">
          Go Home
        </Link>
      </div>
    </div>
  );
}
