import xlsx from 'xlsx'

const PATH = 'C:/Users/pgilm/OneDrive/Documents/Wow tools/GO AGAIN ROLL Affixes.xlsx'

const HEADERS = [
  'Affix',
  'Category',
  'Class',
  'Spec',
  'Difficulty',
  'Description',
  'Sub Roll',
  'Sub Roll Friction',
  'Friction',
  'Time points',
  'Death-risk points',
  'Restriction level',
  'Maintenance level',
  'Variance level',
  'Exclusion Group',
]

function frictionOf(time, death, restriction, maintenance, variance) {
  return Number(time) + Number(death) + Number(restriction) + Number(maintenance) + Number(variance)
}

function rowFrom(existing, patch) {
  const next = { ...existing, ...patch }
  if (patch['Time points'] != null) {
    next.Friction = frictionOf(
      next['Time points'],
      next['Death-risk points'],
      next['Restriction level'],
      next['Maintenance level'],
      next['Variance level'],
    )
  }
  return next
}

const REPLACEMENTS = {
  'Open Book': {
    Affix: 'Take Five',
    Description:
      'Your intern told you about the five-second rule for dropped toast, and you applied it to theology. After any spell you cast, you must wait until your mana starts regenerating before you may cast again. Wanding and melee are allowed during the wait.',
  },
  Demonetised: {
    Affix: 'Playing with Fire',
    'Exclusion Group': 'Destruction School',
    Description:
      'A fire elemental offered you a timeshare and you signed in triplicate. Once Fire damaging spells become available, you may only deal damage with Fire spells.',
  },
  'Quiet on Set': {
    Affix: 'Creature of Habit',
    Description:
      'Your first pet filled in a loyalty card and you have been too polite to shop around. The first pet family you tame after you learn Feed Pet is the only family you may use for the rest of the run.',
  },
  'Breeze Block': {
    Affix: 'Totem Duty',
    Difficulty: 'medium',
    'Time points': 5,
    'Death-risk points': 10,
    'Restriction level': 3,
    'Maintenance level': 3,
    'Variance level': 1,
    'Exclusion Group': 'Totems',
    Description:
      'The elements clocked you for leaving them idle and put you on a shift. Whenever you are in combat, you must have at least one totem active.',
  },
  'Clean Conscience': {
    Affix: 'Spreading Rumors',
    Description:
      'You refuse to start a fight you cannot gossip about. Corruption must be cast on every enemy you are currently fighting before they die.',
  },
}

const EDITS = {
  Unwarded: {
    Description:
      'A rival wizard told you that armor spells are for people who plan to be hit, and your pride refuses to plan that far ahead. You cannot use Frost Armor, Ice Armor, or Mage Armor. Ice Block, Ice Barrier, and Mana Shield are still allowed.',
  },
  "Brawler's Code": {
    'Exclusion Group': '',
    Description:
      'You tried sneaking once, got bored halfway through, and announced your arrival by kicking the door in. Once you are in combat, you must remain in melee range of your current target. You cannot kite, and you cannot finish a fight with ranged attacks.',
  },
  'Moonkin Out of Order': {
    'Exclusion Group': 'Shapeshift',
  },
  'Flame Retardant': {
    'Exclusion Group': 'Fire School',
  },
  'Burn Notice': {
    'Exclusion Group': 'Fire School',
  },
  'Totem Mismanagement': {
    'Exclusion Group': 'Totems',
  },
  'Out of Bolts': {
    'Exclusion Group': 'Destruction School',
  },
}

const RENAME = {
  'Open Book': 'Take Five',
  Demonetised: 'Playing with Fire',
  'Quiet on Set': 'Creature of Habit',
  'Breeze Block': 'Totem Duty',
  'Clean Conscience': 'Spreading Rumors',
}

const DROP_SYNERGIES = new Set([
  'Lights Out; Flash Photography',
  'Passive Aggressive; Quiet on Set',
  'Stormstruck Out; Breeze Block',
  'Plain Old Weapons; Breeze Block',
  'Uninsured; Unwarded',
  'Open Book; Power Word: No',
  'Self Found; Uninsured',
  'Self Found; Flash Photography',
  'Hot Potato; Flame Retardant',
  'Self Found; Shattered Expectations',
  'Self Found; House Call',
  'Lights Out; House Call',
  'Shattered Expectations; Cold Spell',
])

const ADD_SYNERGIES = [
  ['Playing with Fire; Rain Check', 6, 'Fire damage only, and Rain of Fire, Hellfire, and Shadowburn are gone.'],
  ['Creature of Habit; Furwell, Friend', 6, 'If the pet dies you must tame again, but only from the same family.'],
  ['Party Pooper; Point Blank', 8, 'Always at range and you cannot group. Every pull is a solo kite.'],
]

function renameRequires(requires) {
  return String(requires)
    .split(';')
    .map((part) => {
      const name = part.trim()
      return RENAME[name] || name
    })
    .join('; ')
}

const wb = xlsx.readFile(PATH)
const backup = wb.Sheets['Affixes Backup']
if (!backup) {
  console.error('Affixes Backup missing. Aborting.')
  process.exit(1)
}

const live = xlsx.utils.sheet_to_json(wb.Sheets.Affixes, { defval: '', raw: false })

const next = live.map((row) => {
  const replacement = REPLACEMENTS[row.Affix]
  const renamed = replacement ? rowFrom(row, replacement) : row
  const extra = EDITS[renamed.Affix]
  return extra ? rowFrom(renamed, extra) : renamed
})

wb.Sheets.Affixes = xlsx.utils.json_to_sheet(next, { header: HEADERS })

const synergies = xlsx.utils.sheet_to_json(wb.Sheets.Synergies, { defval: '', raw: false })
const kept = synergies
  .filter((row) => !DROP_SYNERGIES.has(String(row.Requires).trim()))
  .map((row) => {
    const requires = renameRequires(row.Requires)
    if (requires === 'Party Pooper; Point Blank') {
      return {
        Requires: requires,
        Friction: row.Friction,
        Warning: 'Always at range and you cannot group. Every pull is a solo kite.',
      }
    }
    return { Requires: requires, Friction: row.Friction, Warning: row.Warning }
  })

const have = new Set(kept.map((row) => row.Requires))
for (const [Requires, Friction, Warning] of ADD_SYNERGIES) {
  if (Friction <= 0) continue
  if (have.has(Requires)) continue
  kept.push({ Requires, Friction, Warning })
}

wb.Sheets.Synergies = xlsx.utils.json_to_sheet(kept, { header: ['Requires', 'Friction', 'Warning'] })
wb.Sheets['Affixes Backup'] = backup
xlsx.writeFile(wb, PATH)

console.log(
  `Patched ${next.length} affixes. Replaced ${Object.keys(REPLACEMENTS).length}. Synergies ${kept.length}. Backup preserved.`,
)
