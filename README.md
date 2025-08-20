# 🪂 Airdrop Notifier

A simple Node.js project that monitors RSS feeds for keywords (e.g. _airdrop_, _claim_, _distribution_) and pushes matching posts to a private Discord channel via webhooks.

This project is intended as a **curiosity/learning project** for anyone who wants to experiment with setting up automated notifications in Discord using webhooks.

---

## ✨ Features

- Polls any number of RSS or Atom feeds on a schedule
- Matches posts against customizable keywords
- Sends clean embed messages to a Discord channel via a webhook
- Stores already-seen posts in a local SQLite database (so no duplicates)
- Runs continuously with [PM2](https://pm2.keymetrics.io/) or deployable to hosting services like Railway

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourname/airdrop-notifier.git
cd airdrop-notifier
```
