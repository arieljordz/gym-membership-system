import AuditLog from "../models/AuditLog.js";
import logger from "../utils/logger.js";

// Fire-and-forget audit trail writer. Never throws into the request flow.
export const recordAudit = async ({ actor, action, entity, entityId, meta, req }) => {
  try {
    await AuditLog.create({
      actor: actor || req?.user?._id,
      action,
      entity,
      entityId: entityId ? String(entityId) : undefined,
      meta,
      ip: req?.ip,
      userAgent: req?.headers?.["user-agent"],
    });
  } catch (e) {
    logger.warn("Audit log failed:", e.message);
  }
};

export default recordAudit;
