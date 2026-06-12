# 🏋️ Gym Membership Information System (MERN)

A production-ready **Gym Membership Information System** built with the **MERN stack**
(MongoDB, Express.js, React.js, Node.js). It supports member self-service and full
admin management: membership plans, promotions, manual payments with proof upload,
secure QR membership passes, QR scanning for gym entry, attendance tracking, expiry
notifications, dashboards, and exportable reports (PDF/Excel).

---

## ✨ Features

### 👤 Member
- Register / login with JWT (access + refresh tokens), email verification & password reset
- Browse membership plans (Daily / Weekly / Monthly) with auto-applied promotions
- Subscribe and submit a manual payment with proof-of-payment upload
- Receive a secure, HMAC-signed **QR membership pass** once payment is approved
- View current membership, attendance history, and payment history
- Personal dashboard with membership status and days remaining
- Profile management & password change

### 🛠️ Admin / Staff
- **Dashboard analytics** — members, revenue, attendance trends (Chart.js)
- **Plans** — full CRUD + activate/deactivate
- **Promotions** — discount %, validity window, activate/deactivate
- **Payments** — review proof, approve (auto-activates membership + issues QR) or reject
- **Members** — manage users, roles, enable/disable, delete
- **Subscriptions** — view & filter all subscriptions
- **QR Scanner** (staff/admin) — camera scan or manual paste, validates pass & logs entry
- **Attendance** — filter, view, export (Excel/PDF)
- **Reports** — membership / revenue / attendance, export as PDF or Excel
- Automated **expiry reminders** (7 / 3 / 1 days) + auto-expire via daily cron

---

## 🧱 Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, Vite 6, Redux Toolkit, React Router 6, Axios, Bootstrap 5 (dark mode), Chart.js, html5-qrcode, qrcode.react, react-toastify |
| Backend  | Node.js, Express 4, Mongoose 8, JWT, bcryptjs, Multer, QRCode + HMAC, ExcelJS, PDFKit, node-cron, Nodemailer |
| Database | MongoDB |
| Security | Helmet, CORS, rate-limiting, express-validator, signed QR payloads |

---

## 📁 Folder Structure

```
gym-membership-system/
├── server/                     # Express + MongoDB API
│   ├── server.js               # entry: connect DB, start schedulers, listen
│   ├── .env.example
│   └── src/
│       ├── app.js              # express app + middleware + routes
│       ├── config/             # env, db, cloudinary
│       ├── utils/              # logger, ApiError, ApiResponse, token, qrcode, email, exporters
│       ├── models/             # 9 Mongoose models
│       ├── middleware/         # auth, rbac, error, validate, upload, audit
│       ├── services/           # membership, notification, scheduler
│       ├── controllers/        # 9 controllers
│       ├── routes/             # 11 route files
│       └── seed/seed.js        # demo data seeder
│
├── client/                     # React + Vite SPA
│   ├── vite.config.js          # dev proxy -> :5000
│   └── src/
│       ├── main.jsx / App.jsx  # bootstrap + router
│       ├── api/axios.js        # axios instance + interceptors
│       ├── app/store.js        # redux store
│       ├── features/           # auth & theme slices
│       ├── components/         # Layout, Sidebar, Navbar, QRCard, ...
│       ├── pages/              # auth, member, admin, staff pages
│       └── utils/              # format, constants, download
│
└── docs/
    ├── API.md                  # REST API reference
    └── SCHEMA.md               # database schema + ER diagram
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on v22)
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

### 1. Backend
```bash
cd server
cp .env.example .env        # then edit values (or use defaults for local dev)
npm install
npm run seed                # creates demo users, plans, promos, sample data
npm run dev                 # starts API on http://localhost:5000
```

### 2. Frontend
```bash
cd client
cp .env.example .env        # VITE_API_URL=/api (proxied to :5000)
npm install
npm run dev                 # starts SPA on http://localhost:5173
```

Open **http://localhost:5173**.

---

## 🔑 Demo Credentials

| Role   | Email              | Password      |
|--------|--------------------|---------------|
| Admin  | admin@gym.local    | Admin@12345   |
| Staff  | staff@gym.local    | Staff@12345   |
| Member | john@example.com   | Member@123    |

> John already has an **active** membership with an approved payment, an issued QR pass,
> and sample attendance logs — perfect for testing the scanner and dashboards.

---

## 🔐 Environment Variables (server/.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API port | `5000` |
| `CLIENT_URL` | Frontend origin (CORS) | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/gym_membership` |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | JWT signing secrets | change in prod |
| `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES` | Token lifetimes | `15m` / `7d` |
| `QR_SECRET` | HMAC secret for signing QR passes | change in prod |
| `SMTP_*` / `EMAIL_FROM` | Email delivery (optional; logs to console if unset) | — |
| `CLOUDINARY_*` | Image uploads (optional; falls back to local `/uploads`) | — |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed admin credentials | see table above |

---

## 🧾 QR Membership Pass & Scanning

- On payment approval, the server issues a QR pass whose payload
  `{ code, memberId, subscriptionId, expirationDate }` is **HMAC-signed** with `QR_SECRET`.
- The **Scanner** page (staff/admin) reads the QR via camera (or manual paste) and
  `POST /api/attendance/scan`. The server verifies the signature and membership status,
  then records an attendance log with a result:
  `granted`, `denied_expired`, `denied_inactive`, or `not_found`.

---

## 📊 Reports & Exports

Admin can export **membership**, **revenue**, and **attendance** reports as **Excel**
(ExcelJS) or **PDF** (PDFKit) with optional date ranges. Attendance logs are also
exportable from the Attendance page.

---

## 📚 Documentation
- [`docs/API.md`](docs/API.md) — full REST API reference
- [`docs/SCHEMA.md`](docs/SCHEMA.md) — database schema & ER diagram

---

## 📜 Available Scripts

**server**
- `npm run dev` — start API with nodemon
- `npm start` — start API
- `npm run seed` — seed demo data

**client**
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build

---

## 📄 License
MIT — for educational/demo use.
