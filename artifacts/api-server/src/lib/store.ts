export const polls: Record<string, {
  id: string; question: string; options: string[]; votes: Record<string, number>;
  createdAt: number; guildId: string;
}> = {};

export const schedules: Record<string, {
  id: string; action: string; payload: unknown; runAt: number; guildId: string; active: boolean;
}> = {};

export const backups: Record<string, {
  id: string; guildId: string; createdAt: number; data: unknown;
}> = {};

export const economy: Record<string, number> = {};

export const shortUrls: Record<string, { url: string; alias: string; clicks: number; createdAt: number }> = {};

export const apiKeys: Record<string, { key: string; guildId: string; createdAt: number; active: boolean }> = {};

export const captchas: Record<string, { code: string; token: string; expiresAt: number }> = {};

export const games: Record<string, {
  deck: string[]; playerHand: string[]; dealerHand: string[]; bet: number; status: string;
}> = {};

export const verifications: Record<string, { code: string; target: string; type: string; expiresAt: number }> = {};

export const analytics: Record<string, { messages: number; joins: number; leaves: number; commands: number; date: string }[]> = {};

export const notifications: Record<string, { id: string; channelId: string; message: string; scheduledAt: number | null; sent: boolean }[]> = {};
