import Parser from 'rss-parser';
import { hasSeen, markSeen } from '../db.mjs';
import { notifyAll } from '../notifiers.mjs';

const parser = new Parser();

const KEYWORDS = (process.env.KEYWORDS ?? '')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

function matches(text) {
  const t = (text ?? '').toLowerCase();
  return KEYWORDS.length === 0 || KEYWORDS.some(k => t.includes(k));
}

export async function pollRSS() {
  const feeds = (process.env.FEEDS ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const out = [];

  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url);
      const feedTitle = feed.title ?? url;

      for (const item of feed.items ?? []) {
        const id =
          item.guid || item.link || item.title || String(item.pubDate || '');
        if (await hasSeen(url, id)) continue;

        const hay = [
          item.title,
          item.contentSnippet,
          item.content,
          item.summary,
        ].join('\n');
        if (!matches(hay)) continue;

        const ts = Date.parse(item.isoDate || item.pubDate || '') || Date.now();
        const record = {
          source: 'rss',
          from: feedTitle,
          title: item.title ?? '(no title)',
          link: item.link ?? '',
          ts,
          key: [url, id],
        };

        await notifyAll(record, feedTitle);
        await markSeen(record.key[0], record.key[1], record.ts);

        out.push(record);
      }
    } catch (error) {
      console.error('Error occurred while polling RSS feeds:', error);
    }
  }

  return out.sort((a, b) => a.ts - b.ts);
}
