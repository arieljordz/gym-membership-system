import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { toggleTheme } from "../features/theme/themeSlice.js";
import { logoutUser } from "../features/auth/authSlice.js";
import { formatDateTime } from "../utils/format.js";

export default function Navbar({ onToggleSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const mode = useSelector((s) => s.theme.mode);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [openNotif, setOpenNotif] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  const loadNotifs = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifs(data.data);
      setUnread(data.meta?.unread || 0);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadNotifs();
    const t = setInterval(loadNotifs, 60000);
    return () => clearInterval(t);
  }, []);

  const markAll = async () => {
    await api.patch("/notifications/read-all");
    setUnread(0);
    setNotifs((n) => n.map((x) => ({ ...x, isRead: true })));
  };

  const onLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <nav className="navbar bg-body-tertiary border-bottom sticky-top">
      <div className="container-fluid">
        <button className="btn btn-outline-secondary btn-sm d-lg-none" onClick={onToggleSidebar}>
          <i className="bi bi-list" />
        </button>
        <span className="navbar-brand mb-0 h6 d-none d-sm-inline">Gym Membership System</span>
        <div className="d-flex align-items-center gap-2 ms-auto">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => dispatch(toggleTheme())} title="Toggle theme">
            <i className={`bi ${mode === "dark" ? "bi-sun" : "bi-moon-stars"}`} />
          </button>

          <div className="position-relative">
            <button
              className="btn btn-outline-secondary btn-sm position-relative"
              onClick={() => {
                setOpenNotif((v) => !v);
                setOpenUser(false);
              }}
            >
              <i className="bi bi-bell" />
              {unread > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unread}
                </span>
              )}
            </button>
            {openNotif && (
              <div className="card shadow position-absolute end-0 mt-2" style={{ width: 320, zIndex: 1050 }}>
                <div className="card-header d-flex justify-content-between align-items-center py-2">
                  <strong className="small">Notifications</strong>
                  <button className="btn btn-link btn-sm p-0" onClick={markAll}>
                    Mark all read
                  </button>
                </div>
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {notifs.length === 0 && <div className="p-3 text-muted small">No notifications</div>}
                  {notifs.map((n) => (
                    <div key={n._id} className={`px-3 py-2 border-bottom small ${n.isRead ? "" : "bg-warning bg-opacity-10"}`}>
                      <div className="fw-semibold">{n.title}</div>
                      <div className="text-muted">{n.message}</div>
                      <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                        {formatDateTime(n.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="position-relative">
            <button
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
              onClick={() => {
                setOpenUser((v) => !v);
                setOpenNotif(false);
              }}
            >
              <i className="bi bi-person-circle" />
              <span className="d-none d-md-inline">{user?.firstName}</span>
            </button>
            {openUser && (
              <div className="card shadow position-absolute end-0 mt-2" style={{ width: 200, zIndex: 1050 }}>
                <div className="list-group list-group-flush">
                  <button
                    className="list-group-item list-group-item-action"
                    onClick={() => {
                      navigate("/profile");
                      setOpenUser(false);
                    }}
                  >
                    <i className="bi bi-person-gear me-2" />
                    Profile
                  </button>
                  <button className="list-group-item list-group-item-action text-danger" onClick={onLogout}>
                    <i className="bi bi-box-arrow-right me-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
