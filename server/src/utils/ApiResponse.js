// Standard success envelope used across the API.
export const sendSuccess = (
  res,
  { statusCode = 200, message = "OK", data = null, meta = undefined } = {}
) =>
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });

export const paginate = (query, { page = 1, limit = 10 }) => {
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  return { skip: (p - 1) * l, limit: l, page: p };
};

export default sendSuccess;
