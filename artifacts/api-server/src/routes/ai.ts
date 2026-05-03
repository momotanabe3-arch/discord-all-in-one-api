import { Router } from "express";
import { z } from "zod";
import OpenAI from "openai";
import { authMiddleware } from "../middleware/auth.js";
import { ok, fail } from "../lib/response.js";

const router = Router();

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"] ?? "no-key",
  baseURL: process.env["OPENAI_BASE_URL"] ?? "https://api.openai.com/v1",
});

const PERSONALITIES: Record<string, string> = {
  assistant: "You are a helpful Discord bot assistant.",
  friendly: "You are a super friendly, enthusiastic Discord bot who loves helping people!",
  sarcastic: "You are a sarcastic but ultimately helpful Discord bot. Add dry humor to responses.",
  professional: "You are a professional, concise Discord bot focused on accurate information.",
  gamer: "You are a gamer Discord bot. Use gaming slang and references when appropriate.",
};

const ChatSchema = z.object({
  message: z.string().min(1).max(2000),
  personality: z.string().default("assistant"),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).default([]),
  language: z.string().default("English"),
});

router.post("/ai/chat", authMiddleware, async (req, res) => {
  const parsed = ChatSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { message, personality, history, language } = parsed.data;
  const systemPrompt = `${PERSONALITIES[personality] ?? PERSONALITIES["assistant"]} Always respond in ${language}.`;

  if (!process.env["OPENAI_API_KEY"]) {
    return ok(res, {
      reply: `[AI Demo] You said: "${message}". To enable real AI, set OPENAI_API_KEY in your environment.`,
      model: "demo",
      tokens_used: 0,
    });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
      ],
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content ?? "";
    return ok(res, {
      reply,
      model: completion.model,
      tokens_used: completion.usage?.total_tokens ?? 0,
    });
  } catch (err) {
    return fail(res, `AI error: ${(err as Error).message}`, 502);
  }
});

export default router;
