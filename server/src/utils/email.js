import nodemailer from "nodemailer";
import env from "../config/env.js";
import logger from "./logger.js";

let transporter = null;

// Built once — avoids re-interpolating on every send.
const FROM = `"Gym Membership" <${env.smtp.user}>`;

const getTransporter = () => {
  if (!env.smtp.user || !env.smtp.pass) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
      // Reuse SMTP connections instead of doing a fresh TCP + TLS
      // handshake and re-auth for every message. This is the single
      // biggest speed-up for back-to-back sends.
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      // Fail fast instead of letting a slow/dead SMTP server hang a request.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });

    // Warm up + verify the pool once, in the background. Never block
    // the first real send on this check.
    transporter
      .verify()
      .then(() => logger.info("SMTP (Gmail) pool is ready to send emails"))
      .catch((err) => logger.error("SMTP connection error:", err));
  }

  return transporter;
};

/**
 * Send an email and await the SMTP result.
 * Use only when the caller actually needs the delivery outcome.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const t = getTransporter();

  if (!t) {
    logger.info(`[EMAIL:DEV] To: ${to} | Subject: ${subject}\n${text || html}`);
    return { dev: true };
  }

  try {
    return await t.sendMail({ from: FROM, to, subject, html, text });
  } catch (err) {
    logger.error("Email send failed:", err);
    throw err;
  }
};

/**
 * Fire-and-forget email. Returns immediately so the HTTP response is
 * never blocked on the SMTP round-trip; failures are logged, not thrown.
 * Prefer this for transactional emails where the response doesn't depend
 * on the delivery result (verification, password reset, notifications).
 */
export const queueEmail = (options) => {
  setImmediate(() => {
    sendEmail(options).catch(() => {
      /* already logged inside sendEmail */
    });
  });
};

export default sendEmail;