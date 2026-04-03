# DevFarm 🌾

DevFarm is a browser-first idle farming game designed for developers. It now ships as a modular ES module project with a lightweight build step, a real menu/options flow, save slots, import/export, audio, and a versioned save format.

## Why it is fun

- **Code-flavored crops**: Variables, functions, classes, APIs, algorithms, databases, and ML models.
- **Progression loop**: Level up, unlock rarities, and keep expanding your farm.
- **Upgrades with impact**: Boost yield, speed, bug protection, and auto-harvest.
- **Live events**: Random bonuses, refactors, deploys, outages, and code reviews.
- **Dev aesthetic**: GitHub-dark palette, monospace UI, and a terminal-style layout.

## Quick start

1. Clone and open:
```bash
git clone https://github.com/ChristopherDond/DevFarm.git
cd DevFarm
```

2. Run locally:
```bash
npm run dev
```

3. Build for release:
```bash
npm run build
```

4. Preview the built output:
```bash
npm run preview
```

## How to play

- **Plant**: Click an empty plot and pick a seed.
- **Harvest**: Click ready crops to collect tokens.
- **Fix bugs**: If a plot shows a bug, click it for rewards.
- **Upgrade**: Buy upgrades to scale growth, yield, and automation.
- **Track progress**: Check stats, badges, and contracts.

## What is inside

```
DevFarm/
├── index.html          # Minimal shell
├── src/                # Game, UI, storage, audio, data, styles
├── scripts/            # Build and preview helpers
├── dist/               # Build output
└── README.md           # Project overview
```

## Tech stack

- **HTML5** for structure
- **CSS3** for layout, theming, and animation
- **JavaScript ES modules** for logic, UI, storage, and audio
- **Node.js** for the custom build/preview scripts

## Gameplay highlights

- **Idle mechanics**: Growth continues with minimal input.
- **Resource strategy**: Balance planting costs with long-term gains.
- **Events & contracts**: Short-term challenges and rewarding bursts.
- **Achievements**: Earn badges for milestones and mastery.
- **Release flow**: Menu, options, save slots, export/import, and a versioned save format.

## Build notes

- The project no longer depends on a giant monolithic HTML file.
- `npm run build` copies the modular source into `dist/` for release packaging.
- Audio uses generated Web Audio effects, so there are no fragile external sound dependencies.

## Browser support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

Ideas and improvements are welcome. Open an issue or send a pull request.

## License

See [LICENSE](LICENSE).

---

**Enjoy the harvest, and ship it.**