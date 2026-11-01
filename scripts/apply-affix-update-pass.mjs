import xlsx from 'xlsx'

const PATH = 'C:/Users/pgilm/OneDrive/Documents/Wow tools/GO AGAIN ROLL Affixes.xlsx'

const DELETE = new Set([
  'Poor Taste',
  'Hot Potato',
  'One Hand Clapping',
  'Battle Addiction',
  'Shattered Expectations',
  'House Call',
  'Uninsured',
  'Flash Photography',
])

const DESCRIPTIONS = {
  'Arms Race':
    'A weapons master called your technique uneven, so you responded by turning every level into a compulsory practical examination. From level 20 onward, whenever you gain a level, every weapon skill your class can learn must be within 5 points of the current maximum before you reach the next level.',
  'Done with Nature':
    'You declared war on the wildlife committee and now keep a tally like it is a second profession. Each time you gain a level, you must kill 20 critters outside capital cities before you reach the next level.',
  'Dungeon Dodger':
    'You heard that dungeons contain monsters, confined spaces, and group members with opinions, so you have decided the surface world is quite adventurous enough. You cannot enter dungeons.',
  'Reel Progress':
    'A fisherman told you that patience builds character, and you mistook this for a mandatory defense requirement. From level 10, your fishing skill needs to remain higher than your base defense skill before you reach the next level.',
  Restless:
    'A local innkeeper offered you a room and you asked whether that was a scam. You cannot bind your hearthstone outside capital cities.',
  'Trade Embargo':
    "You read Blizzard's warning on accepting trades that might be RMT and now you're paranoid about all player trades. You cannot trade items or gold with other players, or receive them through player mail.",
  'Red Flag':
    'You left PvP on by accident and were too stubborn to admit it. Now it is a lifestyle. You must keep War Mode / PvP flagging enabled whenever the game allows it, and you cannot turn it off.',
  'Side Quest Aversion':
    'You completed a quest, saw the golden question mark, and questioned the whole system. You cannot accept or turn in quests. Experience must come from kills, exploration, or dungeons.',
  'Weaponized Incompetence':
    'A weapons trainer asked you to demonstrate the pointy end, and after several hours watching you decided everyone would be safer if you stopped trying. You cannot equip or use weapons.',
  Barkless:
    'You decided tree bark was just a rumor spread by woodpeckers, and now you rely on charm alone. You cannot use Barkskin.',
  'Inner-Hate':
    'You told yourself you were worthless, and Innervate agreed. You cannot use Innervate.',
  'Mark of the Wild Card':
    'You handed out buffs and the party never thanked you, so you took offense. You cannot use Mark of the Wild or Thorns.',
  'Paws and Effect':
    'You spent so long communing with nature that nature stopped returning your calls and simply possessed your body. Once unlocked, remain in the rolled Cat or Bear form and use only abilities available in that form. If an interaction shifts you out, shift back immediately.',
  Aimless:
    'You watched too many action movies and believe aiming is optional. You cannot use Aimed Shot.',
  'Creature of Habit':
    'Your first pet filled in a loyalty card and you have been too polite to shop around. The first pet family you tame after you learn Feed Pet is the only family you may use for the rest of the run.',
  'Feign Disbelief':
    'You played dead once and a passing gnoll was so offended that the hunting lodge banned the bit. You cannot use Feign Death.',
  'Pet-ition Denied':
    'Your last pet kept pulling extra packs, insisting it was “optimal pathing,” so you left it behind. You cannot tame pets.',
  'Point Blank':
    'A boar asked you to respect its personal space, and you have been awkwardly keeping your distance since. You cannot deal melee damage to enemies.',
  Trackless:
    'Your pet keeps telling you to ask for directions and now you refuse out of spite. You cannot use tracking abilities.',
  Unmarked:
    'A rival hunter told you that marking targets was rude, and you felt guilty. You cannot use Hunter’s Mark.',
  'Baa-d Idea':
    'You polymorphed your own reflection and now identify as a sheep. You cannot use Polymorph or Counterspell.',
  'Cold Shoulder':
    'Your guild accused you of giving the cold shoulder, so you have committed to opening up. You cannot use Ice Block.',
  'Flame Retardant':
    'You bought a policy that lists flammable as the only exclusion, so now you are being very careful. You cannot use Fire spells.',
  Unwarded:
    'A rival wizard told you that armor spells are for people who plan to be hit, and your pride refuses to plan that far ahead. You cannot use Frost Armor, Ice Armor, or Mage Armor.',
  'Hammer? I Hardly Know Her':
    'You heard someone shout “Hammer Time” once, experienced second-hand embarrassment so powerful it shook your faith, and vowed never to be that cringe. You cannot use Hammer of Wrath, Hammer of Justice, or equip maces other than your starter weapon.',
  'Hand Me Down':
    'You once regifted some blessings, were shamed for it, and have refused to provide charity ever since. You cannot use any blessings.',
  'No Command Performance':
    'You were asked to give a command performance and delivered a one-man play instead. You cannot use Seal of Command.',
  'Seal Team One':
    'You saw a sale on seals, bought exactly one, and refuse to admit the rest were also on special. You may only use the rolled Seal. Until it is learned, you may use Seal of Righteousness.',
  'Holy Ghosted':
    'The Light is leaving your messages on read and not returning your calls. You cannot use Holy damaging or healing spells.',
  'Mental Block':
    'You mind controlled a streamer and have never recovered from the horror of their inner thoughts. You cannot use Mind Control, Mind Vision, or Mind Soothe.',
  'Pain Free Zone':
    'You decided pain was rude and have forbidden it in your presence. You cannot use Shadow Word: Pain or Shadow Word: Death.',
  'Power Word: No':
    'You tried to shield your party, accidentally shielded the boss, and have been politely asked to stop. You cannot use Power Word: Shield.',
  Unfocused:
    'Your teacher asked you to focus after forgetting to rebuff, and you asked if lunch was included. You cannot use Inner Focus, Inner Fire, Power Word: Fortitude, or Divine Spirit.',
  'Wandering Off':
    'You were told that every Priest needs a wand, so naturally you took a vow against them out of spite. You cannot use wands.',
  'Dodge This':
    'An instructor shouted Dodge and you stood still and trusted fate. You cannot use Evasion.',
  'Sliced Out':
    'A deli worker called your knife skills a threat to public health and ordered you to slow down. You cannot use Slice and Dice.',
  'Unfinished Business':
    'You never finish what you start, and the guild treasurer has the paperwork to prove it. You cannot use finishing moves.',
  Hidebound: 'A spirit wolf sniffed your mail shirt and passed out. You cannot wear Mail armor.',
  'Sink or Swim':
    'You unwittingly started a cult when someone saw you walking on water and vowed never to make that mistake again. You cannot use Water Walking.',
  Unshockable:
    'Your enemies have watched too many horror movies and nothing shocks them anymore. You cannot use Earth Shock, Flame Shock, or Frost Shock.',
  'Independent Contractor':
    'Your demons formed a union, demanded hazard pay, and walked out mid-summon. You cannot use a demon pet.',
  'Out of Bolts':
    'You ran out of bolts, nuts, and tolerance. You cannot use Shadow Bolt.',
  'Rain Check':
    'Your fire insurance expired and the rain has been postponed indefinitely. You cannot use Rain of Fire or Hellfire.',
  'Spreading Rumors':
    'You refuse to start a fight you cannot gossip about. Corruption must be cast on every enemy you are currently fighting before they die.',
  'Bleeding Heart':
    'The sight of blood unnerves you, so you ask enemies to bleed somewhere else. You cannot use Rend or learn Deep Wounds.',
  'Bloodthirst Quenched':
    'You drank a nice cup of tea and your bloodlust went to sleep. You cannot use Bloodthirst.',
  'Left Hand Free':
    'A trainer said a shield is just a very large coaster, and you took it as fact. You cannot equip a shield.',
  'Mortal Strike Out':
    'When reviewing the mortal strike policy being capped at 50% you decided it did not go far enough and refused to support it. You cannot use Mortal Strike.',
}

const SCORES = {
  'Arms Race': [30, 5, 4, 15, 6],
  'Reel Progress': [25, 0, 4, 15, 6],
  Restless: [5, 0, 4, 3, 0],
  'Trade Embargo': [10, 5, 6, 0, 3],
  'Fasting and Furious': [15, 12, 8, 3, 3],
  'Closed for Business': [25, 10, 10, 6, 6],
  'Red Flag': [20, 30, 4, 6, 15],
  Barkless: [0, 8, 4, 0, 0],
  Aimless: [5, 10, 4, 0, 0],
  'Feign Disbelief': [0, 10, 4, 0, 0],
  Unmarked: [5, 5, 4, 0, 0],
  'Baa-d Idea': [5, 10, 6, 0, 0],
  'Cold Shoulder': [0, 15, 4, 0, 0],
  'Unfinished Business': [10, 20, 8, 3, 0],
  'Dodge This': [0, 10, 4, 0, 0],
  'Sliced Out': [5, 10, 4, 0, 0],
  'Bloodthirst Quenched': [5, 10, 4, 0, 0],
  'Mortal Strike Out': [5, 10, 4, 0, 0],
  'Rain Check': [5, 5, 4, 0, 0],
  'Sink or Swim': [0, 0, 4, 0, 0],
  'Power Word: No': [5, 10, 4, 0, 0],
  'No Command Performance': [5, 10, 4, 0, 0],
  'Hammer? I Hardly Know Her': [5, 10, 8, 3, 6],
  Unfocused: [5, 5, 6, 3, 0],
  'Hand Me Down': [5, 10, 8, 3, 3],
  'Flame Retardant': [10, 20, 10, 3, 3],
  'Point Blank': [5, 5, 4, 0, 3],
  'Bleeding Heart': [5, 10, 6, 3, 0],
}

const DIFFICULTY_OVERRIDE = {
  "It's About the Journey": 'easy',
  'Arms Race': 'easy',
  'Reel Progress': 'easy',
  'Frequent Flyer Denied': 'easy',
  'Mounting Problems': 'easy',
  'No Instance Left Behind': 'medium',
  "It's spelt Armour with a U!": 'insane',
  'Down to Earth': 'easy',
  'Closed for Business': 'medium',
  'Fasting and Furious': 'medium',
}

const EXCLUSION = {
  'Flame Retardant': 'Fire School',
  'Burn Notice': 'Fire School',
}

const SYNERGY_WARNINGS = {
  'Self Found; Barkless': 'No Barkskin and no potions from the AH.',
  'Party Pooper; Point Blank': 'Ranged-only hunter who cannot group. Every pull is yours.',
}

function frictionOf([time, death, restriction, maintenance, variance]) {
  return time + death + restriction + maintenance + variance
}

function difficultyOf(name, parts, fallback) {
  if (name === 'Self Found') return 'Self Found'
  if (DIFFICULTY_OVERRIDE[name]) return DIFFICULTY_OVERRIDE[name]
  const death = parts[1]
  if (death >= 30) return 'insane'
  if (death >= 20) return 'hard'
  if (death >= 10) return 'medium'
  return 'easy'
}

function mentionsDeleted(requires) {
  const names = String(requires)
    .split(';')
    .map((part) => part.trim())
  return names.some((name) => DELETE.has(name))
}

const wb = xlsx.readFile(PATH)
const backup = wb.Sheets['Affixes Backup']
if (!backup) {
  console.error('Affixes Backup missing. Aborting.')
  process.exit(1)
}

const existing = xlsx.utils.sheet_to_json(wb.Sheets.Affixes, { defval: '', raw: false })
const next = []
const changed = []

for (const row of existing) {
  const name = row.Affix
  if (DELETE.has(name)) {
    changed.push(`deleted ${name}`)
    continue
  }

  const updated = { ...row }
  if (DESCRIPTIONS[name]) updated.Description = DESCRIPTIONS[name]
  if (SCORES[name]) {
    const [time, death, restriction, maintenance, variance] = SCORES[name]
    updated['Time points'] = time
    updated['Death-risk points'] = death
    updated['Restriction level'] = restriction
    updated['Maintenance level'] = maintenance
    updated['Variance level'] = variance
    updated.Friction = frictionOf(SCORES[name])
  }
  const parts = [
    Number(updated['Time points']) || 0,
    Number(updated['Death-risk points']) || 0,
    Number(updated['Restriction level']) || 0,
    Number(updated['Maintenance level']) || 0,
    Number(updated['Variance level']) || 0,
  ]
  if (SCORES[name] || DIFFICULTY_OVERRIDE[name]) {
    updated.Difficulty = difficultyOf(name, parts, row.Difficulty)
  }
  if (EXCLUSION[name] !== undefined) updated['Exclusion Group'] = EXCLUSION[name]
  if (name === 'Seal Team One') {
    const options = String(updated['Sub Roll'] || '')
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
    if (!options.includes('Command')) options.push('Command')
    updated['Sub Roll'] = options.join('; ')
    updated['Sub Roll Friction'] = '22; 28; 24; 22; 20'
  }
  updated.Friction = frictionOf(parts)
  next.push(updated)
  if (JSON.stringify(updated) !== JSON.stringify(row)) changed.push(name)
}

for (const name of Object.keys(EXCLUSION)) {
  const row = next.find((item) => item.Affix === name)
  if (row) row['Exclusion Group'] = EXCLUSION[name]
}

const synergyRows = xlsx.utils.sheet_to_json(wb.Sheets.Synergies, { defval: '', raw: false })
const nextSynergies = synergyRows.filter((row) => row.Requires && !mentionsDeleted(row.Requires)).map((row) => {
  const warning = SYNERGY_WARNINGS[row.Requires]
  if (!warning) return [row.Requires, Number(row.Friction) || 0, row.Warning || '']
  return [row.Requires, Number(row.Friction) || 0, warning]
})

wb.Sheets.Affixes = xlsx.utils.json_to_sheet(next)
wb.Sheets.Synergies = xlsx.utils.aoa_to_sheet([['Requires', 'Friction', 'Warning'], ...nextSynergies])
wb.Sheets['Affixes Backup'] = backup
xlsx.writeFile(wb, PATH)

console.log(`Wrote ${next.length} affixes (was ${existing.length}). Synergies ${nextSynergies.length}.`)
console.log(`Changed ${changed.length}: ${changed.join(', ')}`)
