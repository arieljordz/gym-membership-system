import Notification from "../models/Notification.js";
import { sendEmail } from "../utils/email.js";

/**
 * Create an in-app notification and optionally send an email.
 * Pass a full user document (with `email`) when `email: true`.
 */
export const notify = async ({
  user,
  type = "system",
  title,
  message,
  channel = "in_app",
  meta,
  email = false,
  emailHtml,
}) => {
  const userId = user?._id || user;
  const doc = await Notification.create({
    user: userId,
    type,
    title,
    message,
    channel: email ? "email" : channel,
    meta,
  });

  if (email && user?.email) {
    await sendEmail({
      to: user.email,
      subject: title,
      text: message,
      html: emailHtml || `<p>${message}</p>`,
    });
  }
  return doc;
};

export default notify;
