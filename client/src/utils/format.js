const PESO = "\u20B1";

export const peso = (n) =>
  `${PESO}${Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "-";

export const formatDateTime = (d) => (d ? new Date(d).toLocaleString("en-PH") : "-");

export const daysLeft = (d) => {
  if (!d) return 0;
  const ms = new Date(d).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
};

export const titleCase = (s) =>
  String(s || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
