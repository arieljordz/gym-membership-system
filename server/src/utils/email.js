import nodemailer from "nodemailer";
import env from "../config/env.js";
import logger from "./logger.js";

let transporter = null;

const getTransporter = () => {
  if (!env.smtp.user || !env.smtp.pass) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "Gmail", // ✅ simplified Gmail config
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });

    transporter.verify()
      .then(() => console.log("SMTP (Gmail) is ready to send emails"))
      .catch((err) => console.error("SMTP connection error:", err));
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const t = getTransporter();

  if (!t) {
    logger.info(
      `[EMAIL:DEV] To: ${to} | Subject: ${subject}\n${text || html}`
    );
    return { dev: true };
  }

  try {
    return await t.sendMail({
      from: `"Gym Membership" <${env.smtp.user}>`,
      to,
      subject,
      html,
      text,
    });
  } catch (err) {
    logger.error("Email send failed:", err);
    throw err;
  }
};

export default sendEmail;