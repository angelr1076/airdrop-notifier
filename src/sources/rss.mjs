import Parser from 'rss-parser';
import { hasSeen, markSeen } from '../db.mjs';
import { notifyAll } from '../notifiers.mjs';

const parser = new Parser();

const KEYWORDS = (process.env.KEYWORDS ?? '')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

const REQ_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
  Accept:
    'application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8',
};

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
      // Log HTTP errors explicitly
      const res = await fetch(url, { headers: REQ_HEADERS });
      if (!res.ok) {
        console.error(`RSS preflight failed: ${url} → HTTP ${res.status}`);
        continue;
      }
      const xml = await res.text();

      const feed = await parser.parseString(xml);
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
    } catch (e) {
      console.error(`Error polling feed ${url}:`, e?.message ?? e);
    }
  }

  return out.sort((a, b) => a.ts - b.ts);
}
