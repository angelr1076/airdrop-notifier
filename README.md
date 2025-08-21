# 🪂 Airdrop Notifier

A simple Node.js worker. It polls configured RSS feeds, filters by keywords, and posts matches to Discord via a webhook.

This project is intended as a **curiosity/learning project** for anyone who wants to experiment with setting up automated notifications in Discord using webhooks.

## ✨ Features

- Polls any number of RSS or Atom feeds on a schedule
- Matches posts against customizable keywords
- Sends clean embed messages to a Discord channel via a webhook
  - You'll need to create the Discord channel then in `Settings` click on `Integrations` > `Webhooks`, create a new Webhook, name it and add it to your `.env` as `DISCORD_WEBHOOK_URL`
- Stores already-seen posts in a ~~local SQLite database~~ Postgres database
- Hosted on Railway
- Runs continuously with [PM2](https://pm2.keymetrics.io/) if you're running locally, or deployable to hosting services like Railway

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/<yourname>/airdrop-notifier.git
cd airdrop-notifier
```
