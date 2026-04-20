# DevFarm 🌾

[English version](README.md)

DevFarm é um jogo idle de fazenda no navegador, feito para desenvolvedores. Você planta crops com tema de programação, colhe tokens, compra upgrades, completa contratos e progride até o sistema de prestígio.

## Foco da release atual (v2.1)

- Economia ajustada para deixar a progressão mais suave entre Lv.6 e Lv.16, com menos travas no meio da campanha.
- UX refinada com indicadores de status mais claros e tutorial guiado mais fácil de acompanhar.
- Saves antigos continuam compatíveis graças à migração de estado e às fixtures de QA.

## Início rápido

```bash
git clone https://github.com/ChristopherDond/DevFarm.git
cd DevFarm
npm run dev
```

Abra em: `http://localhost:4173`

## Comandos

```bash
# Servidor de desenvolvimento
npm run dev

# Build de release em dist/
npm run build

# Preview (usa dist/ se existir)
npm run preview

# Valida migração/normalização de save
npm run qa:saves
```

## Estrutura do projeto

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

## Como jogar

- Plante nos plots vazios.
- Colha crops prontos para ganhar tokens e XP.
- Compre sementes e upgrades.
- Complete contratos e metas de longo prazo.
- Use prestígio para resetar e escalar melhor no longo prazo.

## Licença

Veja [LICENSE](LICENSE).