import type { Request, Response, NextFunction } from "express";
import { validateToken } from "../lib/discord.js";
import { fail } from "../lib/response.js";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return fail(res, "Missing Authorization header", 401);

  const token = authHeader.startsWith("Bot ") ? authHeader.slice(4) : authHeader;
  if (!token) return fail(res, "Invalid Authorization header format. Use: Bot <token>", 401);

  const result = await validateToken(token);
  if (!result.valid) return fail(res, "Invalid or unauthorized Discord bot token", 401);

  res.locals["botToken"] = token;
  res.locals["botUser"] = result.user;
  res.locals["botGuilds"] = result.guilds ?? [];
  next();
}
