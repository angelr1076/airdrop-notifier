import 'dotenv/config';
import { pollRSS } from './sources/rss.mjs';

const period = Math.max(60, Number(process.env.POLL_SECONDS ?? 300)) * 1000;

async function cycle() {
  await pollRSS(); // Posts & marks seen
}

(async () => {
  await cycle();
  setInterval(() => cycle().catch(() => {}), period);
})();
