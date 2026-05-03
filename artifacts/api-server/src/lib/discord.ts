const DISCORD_API = "https://discord.com/api/v10";

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
}

export interface DiscordGuild {
  id: string;
  name: string;
}

const tokenCache = new Map<string, { user: DiscordUser; guilds: DiscordGuild[]; expiresAt: number }>();

export async function validateToken(token: string): Promise<{ valid: boolean; user?: DiscordUser; guilds?: DiscordGuild[] }> {
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return { valid: true, user: cached.user, guilds: cached.guilds };
  }

  try {
    const [userRes, guildsRes] = await Promise.all([
      fetch(`${DISCORD_API}/users/@me`, {
        headers: { Authorization: `Bot ${token}` },
      }),
      fetch(`${DISCORD_API}/users/@me/guilds`, {
        headers: { Authorization: `Bot ${token}` },
      }),
    ]);

    if (!userRes.ok) return { valid: false };

    const user = (await userRes.json()) as DiscordUser;
    const guilds = guildsRes.ok ? ((await guildsRes.json()) as DiscordGuild[]) : [];

    tokenCache.set(token, { user, guilds, expiresAt: Date.now() + 60_000 });
    return { valid: true, user, guilds };
  } catch {
    return { valid: false };
  }
}

export async function getChannelMessages(token: string, channelId: string, limit = 100) {
  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages?limit=${Math.min(limit, 100)}`, {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!res.ok) throw new Error(`Discord API error: ${res.status}`);
  return res.json();
}
