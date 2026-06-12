import nodemailer from "nodemailer";
import env from "../config/env.js";
import logger from "./logger.js";

let transporter = null;

const getTransporter = () => {
  if (!env.smtp.host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: Number(env.smtp.port),
      secure: Number(env.smtp.port) === 465,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
      requireTLS: Number(env.smtp.port) === 587,
    });
    transporter.verify()
      .then(() => console.log("SMTP is ready to send emails"))
      .catch((err) => console.error("SMTP connection error:", err));
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
