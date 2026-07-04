# 2026 Career Mode — Paddock Tracker

A single-page, no-backend tracker for a 2–4 player F1 "career mode" league with friends,
built around the 2026 grid (teams, drivers, calendar). Styled after F1's own broadcast
graphics (Titillium Web, angled panels, team colours).

## What it does

- **Careers** — one card per player: name, career points, acclaim, and a round-by-round
  log (Round 1 / 2 / 3 / Randomized by default, add as many as you like) recording which
  team they applied to, points earned, and whether the move succeeded.
- **Teams** — the 11-team 2026 grid with an editable "points required" and "reputation"
  bar per team, and a live **chance of success** readout for whichever player you select
  (`chance = (career points ÷ points required) × reputation`, capped at 100%).
- **Drivers** — the confirmed 2026 seat assignments, reassignable if your league's story
  diverges from reality.
- **Standings** — editable Drivers' and Constructors' Championship tables that re-sort
  automatically.
- **Calendar** — the 2026 season's 22 rounds (after the Bahrain/Saudi cancellations),
  with a tick-box per race and room to add your own.
- **Data** — export the whole save as a `.json` file, import one back in, or reset to
  the 2026 defaults.

## How data storage works

This is a static page — there's no server and no database. All of your league's data
lives in **this browser's `localStorage`**. That means:

- It survives closing the tab and restarting the browser, on the same device.
- It does **not** sync between devices or between people automatically.
- To play with 2–3 friends, the simplest approach is: whoever's "turn" it is opens
  the page, makes their updates, then hits **Export save** on the Data tab and sends
  the `.json` file to the group. The next person opens the page and hits **Import save**
  before they start, so everyone's working from the same file. Treat the exported
  `.json` as your actual save file — back it up somewhere outside the browser.

## Hosting it on GitHub Pages

1. Create a new **private** repository on GitHub (e.g. `f1-2026-career`).
2. Add these four files to it: `index.html`, `style.css`, `data.js`, `app.js`.
3. Commit and push.
4. In the repo, go to **Settings → Pages**, set **Source** to your default branch
   (usually `main`) and root folder, then save.
   - Note: GitHub Pages sites are publicly reachable by URL even from a private repo,
     unless you're on a paid GitHub plan with Pages access control. If you want it
     truly private, either keep it as a private repo and just open `index.html`
     locally / share it as a file, or use GitHub's Pages visibility settings if your
     plan supports them.
5. Give it a minute, then visit `https://<your-username>.github.io/<repo-name>/`.

## Editing the 2026 reference data

All of the starting teams/drivers/calendar live in `data.js` as plain arrays — edit
them directly if a trade happens, a date gets confirmed, or you just want different
starting points-required/reputation numbers. Changes to `data.js` only affect **new**
saves; anyone with an existing save should use **Reset to defaults** on the Data tab
(after exporting a backup if they want to keep their save) to pick up the changes.
