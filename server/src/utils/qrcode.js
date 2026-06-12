import crypto from "crypto";
import QRCode from "qrcode";
import env from "../config/env.js";

// Deterministic, key-sorted JSON so signatures are reproducible.
const canonical = (obj) =>
  JSON.stringify(
    Object.keys(obj)
      .sort()
      .reduce((acc, k) => {
        acc[k] = obj[k];
        return acc;
      }, {})
  );

// Returns the original payload plus an HMAC signature (`sig`).
export const signQrPayload = (payload) => {
  const sig = crypto
    .createHmac("sha256", env.qrSecret)
    .update(canonical(payload))
    .digest("hex");
  return { ...payload, sig };
};

export const verifyQrSignature = (signed) => {
  if (!signed || typeof signed !== "object" || !signed.sig) return false;
  const { sig, ...payload } = signed;
  const expected = crypto
    .createHmac("sha256", env.qrSecret)
    .update(canonical(payload))
    .digest("hex");
  const a = Buffer.from(String(sig));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// Encodes any string into a PNG data URL.
export const generateQrDataUrl = (text) =>
  QRCode.toDataURL(text, { errorCorrectionLevel: "M", margin: 1, width: 320 });

export const parseQrText = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};
