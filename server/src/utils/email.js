import nodemailer from "nodemailer";
import env from "../config/env.js";
import logger from "./logger.js";

let transporter = null;

const getTransporter = () => {
  if (!env.smtp.host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    });
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const t = getTransporter();
  if (!t) {
    logger.info(`[EMAIL:DEV] To: ${to} | Subject: ${subject}\n${text || html}`);
    return { dev: true };
  }
  return t.sendMail({ from: env.emailFrom, to, subject, html, text });
};

export default sendEmail;
