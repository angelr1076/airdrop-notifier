/** @typedef {(item: any, feedTitle: string) => Promise<void>} Notifier */
const notifiers = /** @type {Notifier[]} */ ([]);

export function registerNotifier(fn) {
  if (typeof fn === 'function') notifiers.push(fn);
}

export async function notifyAll(item, feedTitle) {
  if (notifiers.length === 0) return;
  await Promise.allSettled(notifiers.map(n => n(item, feedTitle)));
}

async function discordNotifier(item, feedTitle) {
  const baseUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!baseUrl) return;

  const threadId = process.env.DISCORD_THREAD_ID?.trim();
  const webhookUrl = threadId
    ? `${baseUrl}?thread_id=${encodeURIComponent(threadId)}`
    : baseUrl;

  const payload = {
    username: process.env.DISCORD_USERNAME || 'Airdrop Notifier',
    avatar_url:
      process.env.DISCORD_AVATAR_URL || 'https://i.imgur.com/fSdQHd8.png',
    content: `🪂 Possible airdrop-related post from ${feedTitle}`,
    allowed_mentions: { parse: [] }, [
      {
        title: item.title ?? '(no title)',
        url: item.link || undefined,
        timestamp: new Date(item.ts || Date.now()).toISOString(),
        footer: { text: 'RSS Monitor' },
      },
    ],
  };

  const post = async () => {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status === 429) {
      const ra = res.headers.get('retry-after');
      const ms = ra ? Math.ceil(Number(ra)) * 1000 : 1500;
      await new Promise(r => setTimeout(r, isNaN(ms) ? 1500 : ms));

      const retryRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!retryRes.ok) {
        const txt = await retryRes.text().catch(() => '');
        console.error('Discord webhook error (retry):', retryRes.status, txt);
      }
      return;
    }

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error('Discord webhook error:', res.status, txt);
    }
  };

  try {
    await post();
  } catch (err) {
    console.error('Failed to send Discord webhook:', err?.message || err);
  }
}

if (process.env.DISCORD_WEBHOOK_URL) {
  registerNotifier(discordNotifier);
}
