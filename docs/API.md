# 📡 REST API Reference

Base URL: `http://localhost:5000/api`

All responses use a consistent envelope:

```json
{ "success": true, "message": "OK", "data": {}, "meta": { "page": 1, "limit": 10, "total": 0, "pages": 0 } }
```

`meta` is included only for paginated list endpoints.

## Authentication

- Send the access token as `Authorization: Bearer <token>` (also accepted via httpOnly cookie).
- A `401` triggers the client to call `POST /auth/refresh` and retry once.

**Roles:** `member`, `staff`, `admin`.
🔒 = authentication required · 🛡️ = role-restricted.

---

## Auth — `/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register a member. Body: `firstName, lastName, email, password, phone?` |
| POST | `/auth/login` | — | Login. Body: `email, password`. Returns access token + user. |
| POST | `/auth/refresh` | cookie/body | Issue a new access token from a valid refresh token. |
| POST | `/auth/logout` | 🔒 | Invalidate the refresh token. |
| GET  | `/auth/verify-email?token=` | — | Verify email via token. |
| POST | `/auth/forgot-password` | — | Request a password-reset email. Body: `email`. |
| POST | `/auth/reset-password` | — | Reset password. Body: `token, password`. |

> Login and password endpoints are rate-limited. Passwords must meet a strong-password policy.

---

## Users — `/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | 🔒 | Current user profile. |
| PATCH | `/users/me` | 🔒 | Update own profile (`firstName, lastName, phone`). |
| PATCH | `/users/me/password` | 🔒 | Change password (`currentPassword, newPassword`). |
| GET | `/users` | 🛡️ admin | List users. Query: `page, limit, role, status, search`. |
| GET | `/users/:id` | 🛡️ admin | Get a user. |
| PATCH | `/users/:id` | 🛡️ admin | Update a user (`role, status`). |
| DELETE | `/users/:id` | 🛡️ admin | Delete a user. |

---

## Plans — `/plans`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/plans` | — | List active plans. `?all=true` (admin) returns all. |
| GET | `/plans/:id` | — | Get a plan. |
| POST | `/plans` | 🛡️ admin | Create plan (`name, type, durationDays, price, description?, features?`). |
| PATCH | `/plans/:id` | 🛡️ admin | Update plan. |
| PATCH | `/plans/:id/toggle` | 🛡️ admin | Toggle `isActive`. |
| DELETE | `/plans/:id` | 🛡️ admin | Delete plan. |

---

## Promotions — `/promos`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/promos/active` | — | List currently-live promotions. |
| GET | `/promos` | 🛡️ admin | List all promotions. `?all=true`. |
| GET | `/promos/:id` | 🛡️ admin | Get a promotion. |
| POST | `/promos` | 🛡️ admin | Create promo (`promoName, code?, discountPercentage, startDate, endDate, appliesToPlans?`). |
| PATCH | `/promos/:id` | 🛡️ admin | Update promo. |
| PATCH | `/promos/:id/toggle` | ��️ admin | Toggle `status`. |
| DELETE | `/promos/:id` | 🛡️ admin | Delete promo. |

---

## Subscriptions — `/subscriptions`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/subscriptions` | 🔒 member | Create a subscription (`planId, promoCode?`). Returns pricing + pending subscription. |
| GET | `/subscriptions/mine` | 🔒 member | List own subscriptions. |
| GET | `/subscriptions/mine/current` | 🔒 member | Current/active membership (with QR pass). |
| PATCH | `/subscriptions/:id/cancel` | 🔒 member | Cancel own subscription. |
| GET | `/subscriptions` | 🛡️ admin | List all. Query: `page, limit, status, member`. |
| GET | `/subscriptions/:id` | 🛡️ admin | Get a subscription. |

---

## Payments — `/payments`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payments` | 🔒 member | Submit payment (multipart: `subscriptionId, method, referenceNumber?, amount, proof` file). |
| GET | `/payments/mine` | 🔒 member | List own payments. |
| GET | `/payments` | 🛡️ admin | List payments. Query: `page, limit, status`. |
| GET | `/payments/:id` | 🛡️ admin | Get a payment. |
| PATCH | `/payments/:id/approve` | 🛡️ admin | Approve → activates subscription, issues QR pass, notifies member. |
| PATCH | `/payments/:id/reject` | 🛡️ admin | Reject (`reason`) → notifies member. |

---

## Attendance — `/attendance`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/attendance/scan` | 🛡️ staff/admin | Scan a QR pass (`qr` = signed JSON/text). Logs entry, returns `scanResult`. |
| GET | `/attendance/mine` | 🔒 member | Own attendance history. |
| GET | `/attendance` | 🛡️ staff/admin | List logs. Query: `page, limit, member, result, dateFrom, dateTo`. |
| GET | `/attendance/export?format=excel\|pdf` | 🛡️ admin | Export attendance (same filters). Returns a file. |

**Scan results:** `granted`, `denied_expired`, `denied_inactive`, `not_found`.

---

## Dashboard — `/dashboard`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/admin` | 🛡️ admin | Aggregated stats: member counts, revenue (daily/weekly/monthly), today''s attendance, and chart datasets (`revenueTrend`, `planDistribution`, `attendanceTrend`). |
| GET | `/dashboard/member` | 🔒 member | Member summary: current membership, days left, recent attendance. |

---

## Reports — `/reports`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reports/membership` | 🛡️ admin | Membership report. Query: `format=json\|excel\|pdf, dateFrom, dateTo`. |
| GET | `/reports/revenue` | 🛡️ admin | Revenue report (approved payments, grouped by day). |
| GET | `/reports/attendance` | 🛡️ admin | Attendance report. |

`format=json` returns data in the standard envelope; `excel`/`pdf` stream a downloadable file.

---

## Notifications — `/notifications`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | 🔒 | List own notifications (with unread count in `meta`). |
| PATCH | `/notifications/:id/read` | 🔒 | Mark one as read. |
| PATCH | `/notifications/read-all` | 🔒 | Mark all as read. |

---

## Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Liveness probe → `{ success: true, message: "OK" }`. |

---

## Error Format

```json
{ "success": false, "message": "Human-readable error", "errors": [ { "field": "email", "message": "..." } ] }
```

Common status codes: `400` validation, `401` unauthenticated, `403` forbidden,
`404` not found, `409` conflict (e.g. duplicate email), `429` rate-limited, `500` server error.
