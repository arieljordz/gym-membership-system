import { QRCodeCanvas } from "qrcode.react";
import { formatDate, daysLeft } from "../utils/format.js";

export default function QRCard({ qrPass, subscription, user }) {
  const value = qrPass?.payload ? JSON.stringify(qrPass.payload) : "";
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body text-center">
        <h5 className="card-title mb-1">Digital Membership Pass</h5>
        <p className="text-muted small mb-3">Present this QR code at the gym entrance</p>
        <div className="qr-frame mx-auto mb-3">
          {value ? (
            <QRCodeCanvas value={value} size={220} level="M" marginSize={2} />
          ) : (
            <img src={qrPass?.qrImage} alt="Membership QR" width={220} />
          )}
        </div>
        <h6 className="mb-0">
          {user?.firstName} {user?.lastName}
        </h6>
        <div className="text-muted small">{subscription?.plan?.name}</div>
        <div className="mt-2">
          <span className="badge bg-success">Active</span>
          <span className="badge bg-secondary ms-1">Expires {formatDate(subscription?.endDate)}</span>
        </div>
        <div className="mt-1 small text-muted">{daysLeft(subscription?.endDate)} day(s) remaining</div>
      </div>
    </div>
  );
}
