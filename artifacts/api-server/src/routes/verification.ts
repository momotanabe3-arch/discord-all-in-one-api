import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { ok, fail } from "../lib/response.js";
import { verifications } from "../lib/store.js";

const router = Router();

function genCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const EmailSendSchema = z.object({ email: z.string().email(), user_id: z.string().min(1) });
const EmailCheckSchema = z.object({ user_id: z.string().min(1), code: z.string().length(6) });
const PhoneSendSchema = z.object({ phone: z.string().min(7).max(15), user_id: z.string().min(1) });
const PhoneCheckSchema = z.object({ user_id: z.string().min(1), code: z.string().length(6) });

router.post("/verify/email/send", authMiddleware, (req, res) => {
  const parsed = EmailSendSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { email, user_id } = parsed.data;
  const code = genCode();
  verifications[`email:${user_id}`] = { code, target: email, type: "email", expiresAt: Date.now() + 10 * 60_000 };

  return ok(res, {
    user_id,
    email,
    sent: true,
    expires_in: 600,
    demo_code: process.env["NODE_ENV"] !== "production" ? code : undefined,
    note: "In production, integrate an email provider (SendGrid, Mailgun, etc.) to deliver the code.",
  });
});

router.post("/verify/email/check", authMiddleware, (req, res) => {
  const parsed = EmailCheckSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { user_id, code } = parsed.data;
  const v = verifications[`email:${user_id}`];
  if (!v) return fail(res, "No pending verification found");
  if (Date.now() > v.expiresAt) { delete verifications[`email:${user_id}`]; return fail(res, "Code expired"); }
  if (v.code !== code) return fail(res, "Invalid code");
  delete verifications[`email:${user_id}`];
  return ok(res, { verified: true, user_id, email: v.target });
});

router.post("/verify/phone/send", authMiddleware, (req, res) => {
  const parsed = PhoneSendSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { phone, user_id } = parsed.data;
  const code = genCode();
  verifications[`phone:${user_id}`] = { code, target: phone, type: "phone", expiresAt: Date.now() + 10 * 60_000 };

  return ok(res, {
    user_id,
    phone,
    sent: true,
    expires_in: 600,
    demo_code: process.env["NODE_ENV"] !== "production" ? code : undefined,
    note: "In production, integrate Twilio or similar to deliver the SMS code.",
  });
});

router.post("/verify/phone/check", authMiddleware, (req, res) => {
  const parsed = PhoneCheckSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { user_id, code } = parsed.data;
  const v = verifications[`phone:${user_id}`];
  if (!v) return fail(res, "No pending verification found");
  if (Date.now() > v.expiresAt) { delete verifications[`phone:${user_id}`]; return fail(res, "Code expired"); }
  if (v.code !== code) return fail(res, "Invalid code");
  delete verifications[`phone:${user_id}`];
  return ok(res, { verified: true, user_id, phone: v.target });
});

export default router;
