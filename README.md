# Roblox Update Checker

Discord webhook notifier for Roblox universe `7072674902` (game `112757576021097`). Checks hourly and pings a role when a new update is published.

## Setup (local)
- Create `env` with:
  - `WEBHOOK_URL=<your discord webhook>`
  - `ROLE_ID=<optional role id>`
  - `LAST_UPDATE_FILE` (optional; defaults to `./last_update.txt`)
- Install deps: `npm install`
- Run: `npm start`

## Deploy on Railway
- Push this repo to GitHub (the `env` file is ignored by `.gitignore`).
- In Railway: New Project → Deploy from Repo.
- Variables:
  - `WEBHOOK_URL`
  - `ROLE_ID` (optional)
  - `LAST_UPDATE_FILE=/app/data/last_update.txt`
  - `NODE_VERSION=18` (optional)
- Volume: add and mount at `/app/data` so `last_update.txt` persists.
- Start command: `npm start`
- Check Logs: look for “Bot is running. Checking for updates every hour.” and “Webhook sent successfully”.

## Notes
- Thumbnail and images are pulled from Roblox; if Discord ever blocks them, swap to a hosted URL and set `imageUrl` fallback.
