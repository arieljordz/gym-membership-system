export const STATUS_BADGE = {
  pending: "warning",
  active: "success",
  expired: "secondary",
  cancelled: "dark",
  approved: "success",
  rejected: "danger",
  inactive: "secondary",
};

export const SCAN_RESULT = {
  granted: { label: "Access Granted", color: "success", icon: "bi-check-circle-fill" },
  denied_expired: { label: "Membership Expired", color: "danger", icon: "bi-x-circle-fill" },
  denied_inactive: { label: "Membership Inactive", color: "warning", icon: "bi-exclamation-triangle-fill" },
  not_found: { label: "Invalid QR Code", color: "secondary", icon: "bi-question-circle-fill" },
};

export const PAYMENT_METHODS = ["gcash", "paymaya", "bank_transfer", "cash", "other"];
