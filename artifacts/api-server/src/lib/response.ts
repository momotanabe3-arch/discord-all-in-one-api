import type { Response } from "express";

export function ok(res: Response, data: unknown = {}) {
  return res.json({ success: true, data, error: null });
}

export function fail(res: Response, error: string, status = 400) {
  return res.status(status).json({ success: false, data: {}, error });
}
