export default function Loader({ full = false, label = "Loading..." }) {
  const cls = full
    ? "d-flex vh-100 align-items-center justify-content-center"
    : "d-flex py-5 align-items-center justify-content-center";
  return (
    <div className={cls}>
      <div className="text-center">
        <div className="spinner-border text-warning" role="status" />
        <div className="mt-2 text-muted small">{label}</div>
      </div>
    </div>
  );
}
