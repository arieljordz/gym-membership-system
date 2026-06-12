# 🗄️ Database Schema

MongoDB (Mongoose) collections and their relationships for the Gym Membership
Information System.

## Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ SUBSCRIPTION : "has"
    USER ||--o{ PAYMENT : "makes"
    USER ||--o{ ATTENDANCE_LOG : "checks in"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ QR_PASS : "owns"
    USER ||--o{ AUDIT_LOG : "acts"

    MEMBERSHIP_PLAN ||--o{ SUBSCRIPTION : "chosen in"
    PROMOTION ||--o{ SUBSCRIPTION : "applied to"
    PROMOTION }o--o{ MEMBERSHIP_PLAN : "appliesToPlans"

    SUBSCRIPTION ||--|| PAYMENT : "paid by"
    SUBSCRIPTION ||--o| QR_PASS : "issues"
    SUBSCRIPTION ||--o{ ATTENDANCE_LOG : "validated against"

    USER {
        ObjectId _id
        string firstName
        string lastName
        string email UK
        string password "bcrypt hashed"
        enum role "member|staff|admin"
        enum status "active|disabled"
        string phone
        bool isEmailVerified
        string emailVerifyTokenHash
        string resetPasswordTokenHash
        date createdAt
    }

    MEMBERSHIP_PLAN {
        ObjectId _id
        string name
        enum type "daily|weekly|monthly|custom"
        int durationDays
        number price
        string description
        string[] features
        bool isActive
    }

    PROMOTION {
        ObjectId _id
        string promoName
        string code
        number discountPercentage
        date startDate
        date endDate
        enum status "active|inactive"
        ObjectId[] appliesToPlans FK
        string description
    }

    SUBSCRIPTION {
        ObjectId _id
        ObjectId member FK
        ObjectId plan FK
        ObjectId promotion FK
        number basePrice
        number discountAmount
        number finalPrice
        enum status "pending|active|expired|cancelled"
        date startDate
        date endDate
    }

    PAYMENT {
        ObjectId _id
        ObjectId member FK
        ObjectId subscription FK
        number amount
        enum method "gcash|paymaya|bank_transfer|cash|other"
        string referenceNumber
        string proofImage
        enum status "pending|approved|rejected"
        ObjectId reviewedBy FK
        string rejectionReason
        date createdAt
    }

    QR_PASS {
        ObjectId _id
        ObjectId member FK
        ObjectId subscription FK
        string code UK
        object payload "signed"
        string qrImage "data URL"
        date expirationDate
        bool isActive
    }

    ATTENDANCE_LOG {
        ObjectId _id
        ObjectId member FK
        ObjectId subscription FK
        date date
        date timeIn
        date timeOut
        enum scanResult "granted|denied_expired|denied_inactive|not_found"
        ObjectId scannedBy FK
    }

    NOTIFICATION {
        ObjectId _id
        ObjectId user FK
        enum type "expiry|payment|system|promo"
        string title
        string message
        bool isRead
        date createdAt
    }

    AUDIT_LOG {
        ObjectId _id
        ObjectId actor FK
        string action
        string entity
        ObjectId entityId
        object meta
        date createdAt
    }
```

## Collection Notes

| Collection | Key fields / indexes | Notes |
|------------|----------------------|-------|
| **users** | unique `email` | bcrypt pre-save hash; `toJSON` strips password & token hashes; `fullName` virtual |
| **membershipplans** | `isActive` | `durationDays` drives subscription end date |
| **promotions** | `code`, `status` | `isLive` virtual = active **and** within date window |
| **subscriptions** | `member`, `status` | `isCurrent` virtual; pricing = base − discount = final |
| **payments** | `member`, `subscription`, `status` | proof stored on Cloudinary or local `/uploads`; approval activates subscription |
| **qrpasses** | unique `code` (`GYM-…`) | payload HMAC-signed with `QR_SECRET`; `qrImage` is a data URL |
| **attendancelogs** | `member`, `date`, `scanResult` | created on each scan; `timeOut` set on second scan of the day |
| **notifications** | `user`, `isRead` | in-app + optional email |
| **auditlogs** | `actor`, `createdAt` | fire-and-forget admin action trail |

## Core Workflow

```
Member subscribes ──▶ Subscription(pending) ──▶ Payment(pending, +proof)
        │                                              │
        ▼                                              ▼
  Admin reviews payment ──approve──▶ Subscription(active) + QR Pass issued + Notification
        │
        └──reject──▶ Payment(rejected, reason) ──▶ Member notified

Member at gym ──▶ Staff scans QR ──▶ verify signature + status
        ├─ valid & active   ──▶ AttendanceLog(granted)
        ├─ expired          ──▶ AttendanceLog(denied_expired)
        ├─ inactive/cancel  ──▶ AttendanceLog(denied_inactive)
        └─ bad/unknown code ──▶ AttendanceLog(not_found)

Daily cron (08:00) ──▶ expiry reminders (7/3/1 days) + auto-expire past-due subscriptions
```
