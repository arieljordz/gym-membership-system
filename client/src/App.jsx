import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe, setInitialized } from "./features/auth/authSlice.js";

import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleRoute from "./components/RoleRoute.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";

import MemberDashboard from "./pages/member/MemberDashboard.jsx";
import Plans from "./pages/member/Plans.jsx";
import MyMembership from "./pages/member/MyMembership.jsx";
import MyAttendance from "./pages/member/MyAttendance.jsx";
import MyPayments from "./pages/member/MyPayments.jsx";
import Profile from "./pages/member/Profile.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ManagePlans from "./pages/admin/ManagePlans.jsx";
import ManagePromos from "./pages/admin/ManagePromos.jsx";
import AdminPayments from "./pages/admin/AdminPayments.jsx";
import Members from "./pages/admin/Members.jsx";
import Subscriptions from "./pages/admin/Subscriptions.jsx";
import AdminAttendance from "./pages/admin/AdminAttendance.jsx";
import Reports from "./pages/admin/Reports.jsx";

import Scanner from "./pages/staff/Scanner.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);

  useEffect(() => {
    if (token) dispatch(fetchMe());
    else dispatch(setInitialized(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<MemberDashboard />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/membership" element={<MyMembership />} />
          <Route path="/attendance" element={<MyAttendance />} />
          <Route path="/payments" element={<MyPayments />} />
          <Route path="/profile" element={<Profile />} />

          <Route element={<RoleRoute roles={["admin", "staff"]} />}>
            <Route path="/scanner" element={<Scanner />} />
          </Route>

          <Route element={<RoleRoute roles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/plans" element={<ManagePlans />} />
            <Route path="/admin/promos" element={<ManagePromos />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/members" element={<Members />} />
            <Route path="/admin/subscriptions" element={<Subscriptions />} />
            <Route path="/admin/attendance" element={<AdminAttendance />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
