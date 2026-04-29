# DevFarm 🌾

[Versão Português](README.pt-BR.md)

DevFarm is a browser-first idle farming game for developers. You plant code-themed crops, harvest tokens, buy upgrades, complete contracts, and progress toward prestige.

## Current release focus (v2.5)

- Smoother progression curve in the early and midgame, with gentler Lv.6-Lv.16 pacing.
- Expanded midgame and late-game content with new crops, contracts, goals, and achievements.
- Quality-of-life actions for bulk planting and harvesting to reduce repetitive clicks.

## Quick start

```bash
git clone https://github.com/ChristopherDond/DevFarm.git
cd DevFarm
npm run dev
```

Open: `http://localhost:4173`

## Commands

```bash
# Dev server
npm run dev

# Build release files into dist/
npm run build

# Preview (uses dist/ if present)
npm run preview

# Validate save migration and normalization
npm run qa:saves
```

## Project structure

```text
DevFarm/
├── index.html
├── src/
│   ├── data.js
│   ├── game.js
│   ├── migrations.js
│   ├── ui.js
│   ├── storage.js
│   ├── audio.js
│   ├── i18n.js
│   └── styles.css
├── scripts/
│   ├── build.mjs
│   ├── preview.mjs
│   └── qa-saves.mjs
├── qa/saves/
├── README.md
└── README.pt-BR.md
```

## How to play

- Plant on empty plots.
- Harvest ready crops for tokens and XP.
- Buy seeds and upgrades.
- Complete contracts and long-term goals.
- Use prestige to reset with stronger long-term scaling.

## License

See [LICENSE](LICENSE).