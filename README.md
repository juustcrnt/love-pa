# 🦄 Unicorn Quest: a private markets adventure

A ~20-minute interactive web game that a private banker plays **with** a client, side by side, to teach private assets.
It is a game, not a training module: the client starts as the founder of a company in a sector they choose, then switches sides to become the investor.
Bilingual (🇬🇧 English / 🇫🇷 Français) and **adaptive** to the client's level of knowledge.

By the end, the client can explain every learning objective in their own words, so they can confidently answer the investor-profile question:
*"Do you have knowledge of private-market investments?"*

---

## Learning objectives

| # | Objective | Chapter |
|---|---|---|
| LO1 | What private assets are; how a fund works (LP / GP / portfolio) | 1 · Founder Mode |
| LO2 | The families: venture & growth, buyout, private debt, infrastructure, real estate (+ secondaries & co-investments in Pro) | 2 · The Map |
| LO4 | How a **vintage** PE fund works: commitment, capital calls, distributions, **J-curve** (+ DPI/RVPI/TVPI/IRR, PME, pacing in Pro) | 3 · Vintage |
| LO3 | Illiquidity: 10+ year lock-up, secondary sales at a discount (+ LP-led/GP-led secondaries in Pro) | 4 · The Time Vault |
| LO5 | Valuation: NAV is estimated, quarterly, lagged and smoothed (+ IPEV/fair value, denominator effect in Pro) | 5 · Into the Fog |
| LO6 | Risk: loss of capital, power law, manager dispersion, diversification across funds & vintages | 6 · Treasure Hunt |
| LO7 | Fees: management fee, hurdle, carried interest, gross vs net (+ catch-up, European vs American waterfall in Pro) | 7 · The Waterfall |
| LO8 | Exits, closed-end vs evergreen/semi-liquid funds & gates, access (qualified investors), portfolio fit (+ FinSA/L-QIF, ELTIF 2.0, LTAF in Pro) | 8 · The Grand Exit |
| ✔ | Final boss: **The Investment Committee** (9–10 questions, one or more per LO) → certificate | Finale |

## How it adapts

1. **Scouting round** (4 quick questions: a self-assessment plus 3 knowledge checks) sets the mode:
   - **✦ Explorer**: builds everything from scratch, with analogies.
   - **◆ Pro**: adds deep-dive cards, live fund metrics, waterfall tiers and harder challenges.
2. **During play**: after 3 perfect challenges in a row, Explorers are offered *Pro*. Pros who struggle twice are offered *Explorer*.
3. The banker can switch modes at any time (HUD chip, or the ☰ console).

## Banker console (facilitator tips)

- Click the **🦄 UNICORN QUEST ☰** logo (or press **M**) to change language or difficulty, jump to any chapter, or restart.
- The **timer** in the top-right turns red after 20:00.
- **📚 Codex** collects every knowledge card unlocked, which is useful for recap.
- The final screen offers **🖨️ Print certificate**.
- Sound effects are synthesised in the browser; toggle them with 🔊.
- No data is stored or sent anywhere: everything runs in the browser.

## Run locally

It's a static site with no build step:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to Vercel

1. Import this repository in Vercel (**Add New → Project**).
2. Framework preset: **Other**. Leave the build command empty and the output directory as the root.
3. Deploy. Or, from the CLI: `npx vercel --prod`.

## Customise

- **Currency**: `PA.CONFIG.currency` in `js/core.js` (default `CHF`).
- **Sectors / company names / sector-specific deals**: `js/sectors.js`.
- **Chapter content** (EN + FR side by side): `js/ch*-*.js`, `js/intro.js`, `js/finale.js`.
- **Look & feel**: `css/style.css` (colour tokens at the top).

> All figures are simplified and illustrative. Educational use only: not investment advice, not an offer.
