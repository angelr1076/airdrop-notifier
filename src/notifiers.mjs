export async function notifyAll(item, feedTitle) {
  if (!process.env.DISCORD_WEBHOOK_URL) return;

  const payload = {
    username: 'Airdrop Notifier',
    avatar_url: 'https://i.imgur.com/YOuRPNG.png',
    content: `🪂 Possible airdrop-related post from **${feedTitle}**`,
    allowed_mentions: { parse: [] }, // Discord channel is locked for all users but me.
    embeds: [
      {
        title: item.title ?? '(no title)',
        url: item.link ?? undefined,
        timestamp: new Date(item.ts || Date.now()).toISOString(),
        footer: { text: 'RSS Monitor' },
      },
    ],
  };

  try {
    const r = await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      console.error('Discord webhook error:', r.status, txt);
    }
  } catch (err) {
    console.error('Failed to send webhook:', err.message);
  }
}
