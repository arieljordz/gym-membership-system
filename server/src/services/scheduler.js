import cron from "node-cron";
import Subscription from "../models/Subscription.js";
import { notify } from "./notificationService.js";
import logger from "../utils/logger.js";

const DAY = 24 * 60 * 60 * 1000;

// Auto-expire lapsed memberships and send 7/3/1-day expiry reminders.
export const runExpiryChecks = async () => {
  const now = new Date();

  const expired = await Subscription.updateMany(
    { status: "active", endDate: { $lt: now } },
    { status: "expired" }
  );
  if (expired.modifiedCount) logger.info(`Auto-expired ${expired.modifiedCount} subscription(s)`);

  for (const days of [7, 3, 1]) {
    const start = new Date(now.getTime() + days * DAY);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const subs = await Subscription.find({
      status: "active",
      endDate: { $gte: start, $lte: end },
    }).populate("member");

    for (const sub of subs) {
      if (!sub.member) continue;
      await notify({
        user: sub.member,
        type: "membership_expiry",
        title: "Membership Expiring Soon",
        message: `Your membership expires in ${days} day(s) on ${new Date(
          sub.endDate
        ).toDateString()}.`,
        email: true,
        meta: { subscriptionId: String(sub._id), days },
      });
    }
  }
};

export const startSchedulers = () => {
  // Runs every day at 08:00 server time.
  cron.schedule("0 8 * * *", () => {
    runExpiryChecks().catch((e) => logger.error("Expiry check failed:", e.message));
  });
  logger.info("Schedulers started (expiry reminders @ 08:00 daily)");
};

export default startSchedulers;
