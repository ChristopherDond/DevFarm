# DevFarm 🌾

[English version](README.md)

DevFarm é um jogo idle de fazenda no navegador, feito para desenvolvedores. Você planta crops com tema de programação, colhe tokens, compra upgrades, completa contratos e progride até o sistema de prestígio.

## Foco da release atual (v2.5)

- Progressão mais suave no início e no meio da campanha, com pacing mais leve entre Lv.6 e Lv.16.
- Conteúdo expandido para o midgame e o endgame, com novos crops, contratos, metas e badges.
- Ações de qualidade de vida para plantar e colher em massa, reduzindo cliques repetidos.

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