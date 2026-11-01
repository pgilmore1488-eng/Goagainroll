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
  Uninsured: {
    Affix: 'Shattered Expectations',
    Description:
      'You told a frost elemental that real mages only hit things that are already miserable. You may only deal damage to enemies that are chilled or frozen. If they are neither, apply a chill first.',
  },
  Demonetised: {
    Affix: 'Playing with Fire',
    'Exclusion Group': 'Destruction School',
    Description:
      'A fire elemental offered you a timeshare and you signed in triplicate. Once Fire damaging spells become available, you may only deal damage with Fire spells.',
  },
  'Flash Photography': {
    Affix: 'House Call',
    Description:
      'You were told the Light works better as a house call, which is not how physics works, but here we are. You cannot heal a target more than 10 yards away.',
  },
  'Quiet on Set': {
    Affix: 'Creature of Habit',
    Description:
      'Your first pet filled in a loyalty card and you have been too polite to shop around. The first pet family you tame is the only family you may use for the rest of the run.',
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
    Affix: 'Spreading Rumours',
    Description:
      'You refuse to start a fight you cannot gossip about. Corruption must be on every enemy you are currently fighting.',
  },
}

const EDITS = {
  Unwarded: {
    Description:
      'A rival wizard told you that armour spells are for people who plan to be hit, and your pride refuses to plan that far ahead. You cannot use Frost Armor, Ice Armor, or Mage Armor. Ice Block, Ice Barrier, and Mana Shield are still allowed.',
  },
  "Brawler's Code": {
    'Exclusion Group': '',
    Description:
      'You tried sneaking once, got bored halfway through, and announced your arrival by kicking the door in. Once you are in combat, you must remain in melee range of your current target. You cannot kite, and you cannot finish a fight with ranged attacks.',
  },
  'Moonkin Out of Order': {
    'Exclusion Group': 'Shapeshift',
  },
  'Hot Potato': {
    'Exclusion Group': 'Fire Spells',
  },
  'Flame Retardant': {
    'Exclusion Group': 'Fire Spells',
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
  Uninsured: 'Shattered Expectations',
  Demonetised: 'Playing with Fire',
  'Flash Photography': 'House Call',
  'Quiet on Set': 'Creature of Habit',
  'Breeze Block': 'Totem Duty',
  'Clean Conscience': 'Spreading Rumours',
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
])

const ADD_SYNERGIES = [
  ['Self Found; Shattered Expectations', 8, 'You can only hit chilled targets and Self Found cannot buy extra frost tools.'],
  ['Self Found; House Call', 6, 'Heals only work at 10 yards and Self Found cannot buy range or safety.'],
  ['Lights Out; House Call', 8, 'No Holy Light, and the heals you still have only work in melee.'],
  ['Shattered Expectations; Cold Spell', 8, 'Frost damage only, and you may only hit targets that are already chilled.'],
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
