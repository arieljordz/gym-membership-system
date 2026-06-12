export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  const nums = [];
  for (let i = 1; i <= pages; i += 1) nums.push(i);
  return (
    <nav className="d-flex justify-content-center mt-3">
      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onChange(page - 1)}>
            Prev
          </button>
        </li>
        {nums.map((n) => (
          <li key={n} className={`page-item ${n === page ? "active" : ""}`}>
            <button className="page-link" onClick={() => onChange(n)}>
              {n}
            </button>
          </li>
        ))}
        <li className={`page-item ${page >= pages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onChange(page + 1)}>
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
