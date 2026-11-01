# GO AGAIN ROLL

World of Warcraft: Forever Hardcore character roller for goagainroll.com.

Play order is one step at a time:

1. Faction
2. Class (roll or pick)
3. Spec (roll or pick)
4. Race (roll or pick from class + faction)
5. Professions (weighted presets, rare wild pairs, or pick)
6. Optional affixes: click difficulty, then category, then affix. Stack as many as you want.

Finished runs get a shareable link.

```
npm install
npm run dev
```

Catalog data lives in `src/data/catalog.json`. Rebuild it from the spreadsheet with:

```
node scripts/build-catalog.mjs
```
