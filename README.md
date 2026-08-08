# 🥏 Disc Golf Tournament Dashboard

A modern, real-time tournament dashboard for your company disc golf tournament. Upload score card photos after each round and Claude AI parses them automatically.

## Features

- **AI-powered score card parsing** — photograph any score card, Claude reads it
- **Round navigation** — browse all rounds with forward/back arrows and round pills
- **Smart leaderboard** — calculates best 5 of 10 rounds per player
- **Historical standings** — navigate to any earlier round to see standings at that point
- **Player avatars** — drop photos in `/public/avatars/` folder
- **10-round tournament** — tracks progress toward completion
- **Responsive dark-mode UI** — looks great on desktop and mobile

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Anthropic for local dev

Create `.env.local` in the project root:

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
# Optional: pin a model your Anthropic account can access
ANTHROPIC_MODEL=claude-3-7-sonnet-latest
```

  ---
    Admin PIN / Access Control

    To protect the "Add Round" and "Edit Round" actions behind a PIN:

    1. Set VITE_ADMIN_PIN in your local .env.local (the PIN users type in the browser):
    VITE_ADMIN_PIN=XXXX
    2. Set ADMIN_SECRET in Cloudflare Pages:
      - Go to Cloudflare Dashboard → Pages → discgolf-dashboard → Settings → Environment variables
      - Add ADMIN_SECRET with the same value as your PIN
      - Apply to Production (and Preview if needed)

    For local dev with wrangler, add it to .dev.vars:
    ADMIN_SECRET=XXXX

    The client sends the PIN as an X-Admin-Secret header on score card upload requests. The server validates it against
    ADMIN_SECRET before calling the Claude API. If ADMIN_SECRET is not set, no authentication is enforced.

The app now sends uploads to a local `/api/parse-scorecard` endpoint, and that endpoint calls Anthropic server-side. This avoids browser CORS failures and keeps the API key out of the client bundle.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Deploy to Cloudflare Pages

Before deploying, add `ANTHROPIC_API_KEY` to your Cloudflare Pages project environment variables.
You can also set `ANTHROPIC_MODEL` (for example `claude-3-7-sonnet-latest`) if your account has limited model access.

**Option A — One-command deploy script:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Option B — Manual steps:**
```bash
# Log in to Cloudflare (only needed once)
npx wrangler login

# Build and deploy
npm run build
npx wrangler pages deploy dist --project-name=discgolf-dashboard
```

**Option C — Connect GitHub (recommended for automatic deploys):**
1. Push this repo to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com)
3. Create new project → Connect to Git
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Every push to `main` auto-deploys!

## Adding Player Avatars

Place player photos in `/public/avatars/` with filenames matching the player name:

```
public/
  avatars/
    john-doe.jpg
    jane-smith.jpg
    ole-hansen.jpg
```

Naming rules:
- Lowercase
- Replace spaces with dashes
- JPG or PNG format
- Square images work best (will be cropped to circle)

If no avatar is found, a colored initials avatar is shown automatically.

## How Score Card Upload Works

1. Click **Add Round** in the header
2. Take a clear photo of the score card (good lighting helps)
3. Upload — the app sends the image to its own server endpoint, which forwards it to Claude for parsing
4. The dashboard updates immediately

**What Claude looks for on the card:**
- Course name
- Date
- Player names
- Hole-by-hole scores
- Round ratings (e.g. 950, 1020 etc.)
- Par values per hole

**Tips for best results:**
- Lay the card flat on a table
- Use good lighting — avoid glare
- Make sure all text is readable
- The entire card should be visible

## Tournament Rules (configurable in `src/App.jsx`)

```js
const TOURNAMENT_NAME = 'Company Disc Golf Championship'
const TOTAL_ROUNDS = 10      // Total rounds in tournament
const ROUNDS_THAT_COUNT = 5  // Best N rounds count toward total
```

## Leaderboard Logic

- Each player's round rating from every completed round is collected
- Only the **5 highest-rated rounds** count toward the total
- If navigating to an earlier round, only rounds up to that point are considered
- Players without a round rating for a given round are excluded from that round's count
- Gaps to leader are shown for each player

## Project Structure

```
discgolf-dashboard/
├── public/
│   ├── avatars/        ← Add player photos here
│   └── disc.svg        ← Favicon
├── src/
│   ├── components/
│   │   ├── Header.jsx       ← Top bar with progress
│   │   ├── RoundNav.jsx     ← Round selector
│   │   ├── ScoreCard.jsx    ← Score table display
│   │   ├── LeaderBoard.jsx  ← Tournament standings
│   │   ├── UploadRound.jsx  ← Upload modal
│   │   ├── PlayerAvatar.jsx ← Avatar with fallback
│   │   └── EmptyState.jsx   ← First-run screen
│   ├── utils/
│   │   ├── parseScoreCard.js ← Browser upload client
│   │   └── scoreCardParsing.js ← Shared Anthropic request/validation logic
├── functions/
│   └── api/
│       └── parse-scorecard.js ← Cloudflare Pages function for production uploads
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── deploy.sh           ← One-command deploy
├── wrangler.toml       ← Cloudflare config
└── vite.config.js
```

## Notes

- Round data is stored in browser memory (no database needed)
- Refreshing the page clears all rounds — this is by design for simplicity
- If you want persistence across sessions, the data can be exported to JSON and re-imported (future feature)
