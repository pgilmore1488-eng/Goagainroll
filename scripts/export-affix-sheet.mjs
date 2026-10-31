import fs from 'node:fs'
import path from 'node:path'
import xlsx from 'xlsx'
import catalog from '../src/data/catalog.json' with { type: 'json' }

const FRICTION = {
  'Back in My Day': 1,
  'Blink and You’ll Miss It': 2,
  'Wandering Off': 2,
  'Burn Notice': 2,
  'First, Do No Bonk': 2,
  'Hands Off Approach': 2,
  "It's About the Journey": 4,
  'Travel Ban': 4,
  'Trapped in the Past': 4,
  Paladruid: 4,
  Featherweight: 5,
  'Furwell, Friend': 5,
  'Purple Reign': 4,
  'Cold Spell': 4,
  'Hammer? I Hardly Know Her': 4,
  'No Stun Intended': 5,
  'Dagger Issues': 4,
  'Shamateur Tank': 4,
  'Self-Careless': 4,
  'Connect the DoTs': 5,
  'Mind Your Language': 4,
  'Imp-ossible to Resist': 4,
  'One-Stance Wonder': 5,
  'Weapon of Choice': 5,
  'No Instance Left Behind': 8,
  'Paws and Effect': 9,
  'Bow Out': 8,
  'Pet-ition Denied': 7,
  'Face Tank': 7,
  'Bubble Trouble': 8,
  'Strictly Discipline': 7,
  'Light Entertainment Only': 7,
  'Holy Ghosted': 7,
  'Assassins Code': 8,
  "Brawler's Code": 8,
  'Totem Mismanagement': 8,
  Demonetised: 7,
  'Fight or Fight': 8,
  'Conan the Barebarian': 6,
}

const categoryLabel = { universal: 'Universal', class: 'Class', spec: 'Spec' }

function fallbackFriction(affix) {
  if (affix.difficulty === 'easy') return 2
  if (affix.difficulty === 'hard') return 7
  return 4
}

const header = ['Affix', 'Category', 'Class', 'Spec', 'Difficulty', 'Description', 'Sub Roll', 'Friction']
const rows = catalog.affixes.map((affix) => [
  affix.name,
  categoryLabel[affix.scope] || affix.scope,
  affix.scope === 'universal' ? 'All' : affix.className || '',
  affix.scope === 'spec' ? (affix.specs || []).join('; ') : 'All',
  affix.difficulty,
  affix.description,
  (affix.subRolls || []).join('; '),
  FRICTION[affix.name] ?? fallbackFriction(affix),
])

const sheet = xlsx.utils.aoa_to_sheet([header, ...rows])
sheet['!cols'] = [
  { wch: 28 },
  { wch: 12 },
  { wch: 12 },
  { wch: 18 },
  { wch: 12 },
  { wch: 90 },
  { wch: 32 },
  { wch: 10 },
]

const notes = xlsx.utils.aoa_to_sheet([
  ['Friction scoring'],
  ['Starter 1-10 values. Easy is about 1-2, medium 4-5, hard 7-9. Edit anything.'],
  ['A run score is the sum of Friction for every affix that landed.'],
  ['Blank Sub Roll means no extra roll. Semicolon-separated values are the sub-roll pool.'],
  ['Each affix can only appear once per run, including those with a sub roll.'],
])

const wb = xlsx.utils.book_new()
xlsx.utils.book_append_sheet(wb, sheet, 'Affixes')
xlsx.utils.book_append_sheet(wb, notes, 'Scoring')

const dest = 'C:/Users/pgilm/OneDrive/Documents/Wow tools/GO AGAIN ROLL Affixes.xlsx'
const local = path.resolve(import.meta.dirname, '../exports/GO AGAIN ROLL Affixes.xlsx')
fs.mkdirSync(path.dirname(local), { recursive: true })
xlsx.writeFile(wb, dest)
xlsx.writeFile(wb, local)
console.log(`Wrote ${rows.length} affixes`)
console.log(dest)
console.log(local)
