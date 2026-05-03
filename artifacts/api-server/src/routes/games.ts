import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { authMiddleware } from "../middleware/auth.js";
import { ok, fail } from "../lib/response.js";
import { games } from "../lib/store.js";

const router = Router();

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function makeDeck(): string[] {
  return SUITS.flatMap(s => RANKS.map(r => `${r}${s}`)).sort(() => Math.random() - 0.5);
}

function cardValue(card: string): number {
  const rank = card.slice(0, -1);
  if (["J", "Q", "K"].includes(rank)) return 10;
  if (rank === "A") return 11;
  return parseInt(rank, 10);
}

function handValue(hand: string[]): number {
  let total = hand.reduce((s, c) => s + cardValue(c), 0);
  let aces = hand.filter(c => c.startsWith("A")).length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

const DealSchema = z.object({ bet: z.number().positive().default(10), user_id: z.string().min(1) });

router.post("/game/blackjack/deal", authMiddleware, (req, res) => {
  const parsed = DealSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { bet, user_id } = parsed.data;
  const id = `${user_id}-bj`;
  const deck = makeDeck();
  const playerHand = [deck.pop()!, deck.pop()!];
  const dealerHand = [deck.pop()!, deck.pop()!];

  games[id] = { deck, playerHand, dealerHand, bet, status: "active" };

  return ok(res, {
    game_id: id,
    player_hand: playerHand,
    player_value: handValue(playerHand),
    dealer_visible: dealerHand[0],
    bet,
    status: "active",
    actions: ["hit", "stand", "double", "surrender"],
  });
});

const ActionSchema = z.object({ user_id: z.string().min(1) });

router.post("/game/blackjack/:action", authMiddleware, (req, res) => {
  const action = req.params["action"] ?? "";
  const parsed = ActionSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0]?.message ?? "Validation error");

  const { user_id } = parsed.data;
  const id = `${user_id}-bj`;
  const game = games[id];
  if (!game) return fail(res, "No active game found. Deal first.", 404);
  if (game.status !== "active") return fail(res, "Game already ended");

  if (action === "hit") {
    game.playerHand.push(game.deck.pop()!);
    const val = handValue(game.playerHand);
    if (val > 21) { game.status = "bust"; delete games[id]; }
    return ok(res, { player_hand: game.playerHand, player_value: val, status: game.status });
  }

  if (action === "surrender") {
    delete games[id];
    return ok(res, { status: "surrender", returned: game.bet / 2 });
  }

  if (action === "double") {
    game.bet *= 2;
    game.playerHand.push(game.deck.pop()!);
  }

  if (action === "stand" || action === "double") {
    while (handValue(game.dealerHand) < 17) game.dealerHand.push(game.deck.pop()!);
    const pv = handValue(game.playerHand), dv = handValue(game.dealerHand);
    const bust = pv > 21;
    const win = !bust && (dv > 21 || pv > dv);
    const push = !bust && dv <= 21 && pv === dv;
    const status = bust ? "bust" : win ? "win" : push ? "push" : "lose";
    const payout = win ? game.bet * 2 : push ? game.bet : 0;
    delete games[id];
    return ok(res, { player_hand: game.playerHand, player_value: pv, dealer_hand: game.dealerHand, dealer_value: dv, status, payout });
  }

  return fail(res, "Invalid action. Use: hit, stand, double, surrender");
});

const SLOT_SYMBOLS = ["🍒", "🍋", "🍊", "⭐", "💎", "7️⃣", "🃏"];

router.post("/game/slots/spin", authMiddleware, (req, res) => {
  const bet = (req.body as { bet?: number }).bet ?? 10;
  const reels = Array.from({ length: 3 }, () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]);
  const win = reels[0] === reels[1] && reels[1] === reels[2];
  const partial = !win && (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]);
  const multiplier = win ? 10 : partial ? 2 : 0;
  const payout = bet * multiplier;

  return ok(res, { reels, bet, multiplier, payout, win, partial, display: reels.join(" | ") });
});

export default router;
