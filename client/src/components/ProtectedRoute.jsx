import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "./Loader.jsx";

export default function ProtectedRoute() {
  const { user, token, initialized } = useSelector((s) => s.auth);
  const location = useLocation();

  if (token && !initialized) return <Loader full />;
  if (!token || !user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}
