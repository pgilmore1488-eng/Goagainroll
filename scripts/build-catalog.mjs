import fs from 'node:fs'
import path from 'node:path'
import xlsx from 'xlsx'

const ROOT = path.resolve(import.meta.dirname, '..')
const SOURCE = 'C:/Users/pgilm/OneDrive/Documents/Wow tools/Hardcore Randomiser.xlsx'
const AFFIX_SOURCE = 'C:/Users/pgilm/OneDrive/Documents/Wow tools/GO AGAIN ROLL Affixes.xlsx'
const OUT = path.join(ROOT, 'src/data/catalog.json')

const AFFIX_ICONS = {
  "It's spelt Armour with a U!": 'inv_misc_pelt_bear_ruin_05',
  'Weaponized Incompetence': 'inv_sword_04',
  'Potion Commotion': 'inv_potion_12',
  'Consume Responsibly': 'inv_potion_52',
  'Unprofessional Conduct': 'inv_misc_wrench_01',
  'No Time for Hobbies': 'inv_misc_note_01',
  'Arms Race': 'inv_axe_04',
  'Dungeon Dodger': 'inv_helmet_08',
  'Reel Progress': 'trade_fishing',
  'Auction House Arrest': 'inv_misc_coin_01',
  'Trade Embargo': 'inv_misc_gift_01',
  'Frequent Flyer Denied': 'ability_hunter_pathfinding',
  'Mounting Problems': 'ability_mount_ridinghorse',
  'Naturally Untalented': 'inv_misc_book_09',
  'Thanks, But No Thanks': 'inv_misc_bag_10',
  'Common Courtesy': 'inv_shirt_grey_01',
  'Fasting and Furious': 'inv_misc_food_15',
  'Self Found': 'inv_misc_coin_05',
  'Pack Light': 'inv_misc_bag_07',
  'Mark of the Wild Card': 'spell_nature_regeneration',
  'Rooted in Failure': 'spell_nature_stranglevines',
  Barkless: 'spell_nature_stoneclawtotem',
  'Pacing Yourself': 'ability_mount_jungletiger',
  'Feign Disbelief': 'ability_rogue_feigndeath',
  'No Kiting Allowed': 'ability_hunter_runningshot',
  'Table for None': 'inv_misc_food_73cinnamonroll',
  'Baa-d Idea': 'spell_nature_polymorph',
  Unwarded: 'spell_frost_frostarmor02',
  'Seal Team One': 'ability_paladin_sealofblood',
  'Hands to Yourself': 'spell_holy_layonhands',
  'Non-Judgemental': 'spell_holy_righteousfury',
  'Power Word: No': 'spell_holy_powerwordshield',
  'Silent Treatment': 'spell_shadow_psychicscream',
  'Dispel Denied': 'spell_holy_dispelmagic',
  'Last in the Race': 'ability_rogue_sprint',
  'Poison Control': 'ability_poisons',
  'Unfinished Business': 'ability_rogue_eviscerate',
  'Howl No': 'spell_nature_spiritwolf',
  Unshockable: 'spell_nature_earthshock',
  'Plain Old Weapons': 'spell_nature_rockbiter',
  'Stone Cold': 'inv_stone_04',
  'Tapped Out': 'spell_shadow_lifedrain02',
  'Nothing to Fear': 'spell_shadow_possession',
  Uncharged: 'ability_warrior_charge',
  'Silent Warrior': 'ability_warrior_battleshout',
  'Left Hand Free': 'inv_shield_06',
  'Moonkin Out of Order': 'spell_nature_forceofnature',
  'Moon Landing Denied': 'spell_nature_starfall',
  'Cat Got Your Tongue': 'ability_druid_prowl',
  'Claws for Concern': 'ability_druid_rake',
  'Healing Touch-y Subject': 'spell_nature_healingtouch',
  'Inner-Hate': 'spell_nature_lightning',
  'Fed Up': 'ability_hunter_mendpet',
  'Passive Aggressive': 'ability_hunter_pet_bear',
  Aimless: 'inv_spear_07',
  Unmarked: 'ability_hunter_snipershot',
  'Sting Operation': 'ability_hunter_quickshot',
  Trackless: 'ability_tracking',
  'Missing Missiles': 'spell_nature_starfall',
  'Evocation Eviction': 'spell_nature_purge',
  'Flame Retardant': 'spell_fire_fireball',
  'Cold Shoulder': 'spell_frost_frost',
  'Snow Day Canceled': 'spell_frost_icestorm',
  'Lights Out': 'spell_holy_holybolt',
  Unconsecrated: 'spell_holy_innerfire',
  'Shield Me Not': 'spell_holy_blessingofprotection',
  'Hand Me Down': 'spell_holy_sealofvalor',
  'No Command Performance': 'ability_paladin_sealofcommand',
  'No Aura Farming': 'spell_holy_devotionaura',
  Unfocused: 'spell_holy_innerfire',
  'Mental Block': 'spell_shadow_shadowworddominate',
  'Smite Out': 'spell_holy_holysmite',
  'Group Therapy Canceled': 'spell_holy_prayerofhealing02',
  Formless: 'spell_shadow_shadowform',
  'Pain Free Zone': 'spell_shadow_shadowwordpain',
  "Backstabber's Honesty": 'ability_backstab',
  'Sliced Out': 'ability_rogue_slicedice',
  'Flurry Canceled': 'ability_warrior_punishingblow',
  'Sinister Misunderstanding': 'spell_shadow_ritualofsacrifice',
  'Sap Happy': 'ability_sap',
  'Dodge This': 'spell_shadow_shadowward',
  'Storm Warning': 'spell_nature_lightning',
  'Sink or Swim': 'spell_frost_windwalkon',
  'Stormstruck Out': 'ability_shaman_stormstrike',
  'Wave Goodbye': 'spell_nature_magicimmunity',
  Hidebound: 'inv_chest_leather_08',
  'Clean Conscience': 'spell_shadow_abominationexplosion',
  'Siphoned Off': 'spell_shadow_siphonmana',
  Unlinked: 'spell_shadow_gathershadows',
  'Hostile Takeover': 'spell_shadow_enslavedemon',
  'Out of Bolts': 'spell_shadow_shadowbolt',
  'Rain Check': 'spell_shadow_rainoffire',
  'Mortal Strike Out': 'ability_warrior_savageblow',
  'Bleeding Heart': 'ability_gouge',
  'Bloodthirst Quenched': 'spell_nature_bloodlust',
  'Calm Down, Dear': 'ability_warrior_innerrage',
  Unprovoked: 'spell_nature_reincarnation',
  'Wall Not Included': 'ability_warrior_shieldwall',
  'Closed for Business': 'inv_misc_coin_04',
  'Never Graduated': 'inv_misc_book_11',
  'Side Quest Aversion': 'inv_misc_questionmark',
  'Party Pooper': 'spell_holy_prayerofhealing02',
  'Red Flag': 'inv_bannerpvp_01',
  'Tourist Visa': 'inv_misc_map_01',
  Restless: 'spell_nature_sleep',
  'Bank Holiday': 'inv_misc_coin_02',
  'Borrowed Power': 'spell_holy_holyprotection',
  'Stuck in the Office': 'ability_druid_catform',
  'Point Blank': 'ability_hunter_snipershot',
  'Down to Earth': 'spell_magic_featherfall',
  'Take Five': 'inv_misc_pocketwatch_01',
  'Loud and Proud': 'ability_stealth',
  'Independent Contractor': 'spell_shadow_summonfelhunter',
  'Totem Duty': 'spell_nature_tremortotem',
  'Sweeping Generalizations': 'ability_rogue_slicedice',
  'Creature of Habit': 'ability_hunter_beasttaming',
  'One with Nature': 'inv_misc_rabbit',
  'Done with Nature': 'ability_hunter_pet_boar',
  'Playing with Fire': 'spell_fire_fire',
  'Spreading Rumors': 'spell_shadow_abominationexplosion',
}

const CLASS_ICONS = {
  Druid: 'classicon_druid',
  Hunter: 'classicon_hunter',
  Mage: 'classicon_mage',
  Paladin: 'classicon_paladin',
  Priest: 'classicon_priest',
  Rogue: 'classicon_rogue',
  Shaman: 'classicon_shaman',
  Warlock: 'classicon_warlock',
  Warrior: 'classicon_warrior',
}

const SPEC_ICONS = {
  'Druid:Feral': 'ability_druid_catform',
  'Druid:Restoration': 'spell_nature_healingtouch',
  'Druid:Balance': 'spell_nature_starfall',
  'Hunter:Beast Mastery': 'ability_hunter_beasttaming',
  'Hunter:Survival': 'ability_hunter_swiftstrike',
  'Hunter:Marksmanship': 'ability_marksmanship',
  'Mage:Arcane': 'spell_holy_magicalsentry',
  'Mage:Fire': 'spell_fire_firebolt02',
  'Mage:Frost': 'spell_frost_frostbolt02',
  'Paladin:Protection': 'spell_holy_devotionaura',
  'Paladin:Retribution': 'spell_holy_auraoflight',
  'Paladin:Holy': 'spell_holy_holybolt',
  'Priest:Discipline': 'spell_holy_wordfortitude',
  'Priest:Holy': 'spell_holy_holybolt',
  'Priest:Shadow': 'spell_shadow_shadowwordpain',
  'Rogue:Assassination': 'ability_rogue_eviscerate',
  'Rogue:Combat': 'ability_backstab',
  'Rogue:Subtlety': 'ability_stealth',
  'Shaman:Enhancement': 'spell_nature_lightningshield',
  'Shaman:Elemental': 'spell_nature_lightning',
  'Shaman:Restoration': 'spell_nature_magicimmunity',
  'Warlock:Affliction': 'spell_shadow_deathcoil',
  'Warlock:Demonology': 'spell_shadow_metamorphosis',
  'Warlock:Destruction': 'spell_shadow_rainoffire',
  'Warrior:Protection': 'ability_warrior_defensivestance',
  'Warrior:Arms': 'ability_warrior_savageblow',
  'Warrior:Fury': 'ability_warrior_innerrage',
}

const RACE_ICONS = {
  Human: 'race_human_male',
  Dwarf: 'race_dwarf_male',
  'Night Elf': 'race_nightelf_male',
  Gnome: 'race_gnome_male',
  Orc: 'race_orc_male',
  Undead: 'race_scourge_male',
  Tauren: 'race_tauren_male',
  Troll: 'race_troll_male',
  Skyborne: 'race_skyborne_male',
}

const PROFESSION_ICONS = {
  Alchemy: 'trade_alchemy',
  Blacksmithing: 'trade_blacksmithing',
  Enchanting: 'trade_engraving',
  Engineering: 'trade_engineering',
  Herbalism: 'trade_herbalism',
  Leatherworking: 'inv_misc_armorkit_17',
  Mining: 'trade_mining',
  Skinning: 'inv_misc_pelt_wolf_01',
  Tailoring: 'trade_tailoring',
}

const NAMED_PAIRS = [
  { id: 'lw-skin', name: 'Leatherworking and Skinning', professions: ['Leatherworking', 'Skinning'] },
  { id: 'eng-mine', name: 'Engineering and Mining', professions: ['Engineering', 'Mining'] },
  { id: 'alch-herb', name: 'Alchemy and Herbalism', professions: ['Alchemy', 'Herbalism'] },
  { id: 'bs-mine', name: 'Blacksmithing and Mining', professions: ['Blacksmithing', 'Mining'] },
  { id: 'tail-ench', name: 'Tailoring and Enchanting', professions: ['Tailoring', 'Enchanting'] },
]

const CLASS_PRESET = {
  Druid: 'lw-skin',
  Hunter: 'lw-skin',
  Mage: 'tail-ench',
  Paladin: 'bs-mine',
  Priest: 'tail-ench',
  Rogue: 'lw-skin',
  Shaman: 'lw-skin',
  Warlock: 'tail-ench',
  Warrior: 'bs-mine',
}

const UNIVERSAL_PAIRS = ['eng-mine', 'alch-herb']

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function blizzard(id) {
  return { source: 'blizzard', id }
}

function splitList(value) {
  return String(value)
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
}

function normalizeSpec(spec) {
  if (spec === 'Assasination') return 'Assassination'
  return spec
}

function pairId(a, b) {
  const named = NAMED_PAIRS.find(
    (pair) =>
      (pair.professions[0] === a && pair.professions[1] === b) ||
      (pair.professions[0] === b && pair.professions[1] === a),
  )
  if (named) return named.id
  return `${slug(a)}-${slug(b)}`
}

function buildProfessionPairs() {
  const names = Object.keys(PROFESSION_ICONS)
  const pairs = [...NAMED_PAIRS]
  for (let i = 0; i < names.length; i += 1) {
    for (let j = i + 1; j < names.length; j += 1) {
      const id = pairId(names[i], names[j])
      if (pairs.some((pair) => pair.id === id)) continue
      pairs.push({
        id,
        name: `${names[i]} and ${names[j]}`,
        professions: [names[i], names[j]],
      })
    }
  }
  return pairs.map((pair) => ({
    ...pair,
    icon: blizzard(PROFESSION_ICONS[pair.professions[0]]),
  }))
}

function professionWeight(className, pairIdValue) {
  if (CLASS_PRESET[className] === pairIdValue) return 70
  if (UNIVERSAL_PAIRS.includes(pairIdValue)) return 12
  return 0.2
}

const wb = xlsx.readFile(SOURCE)
const comboRows = xlsx.utils.sheet_to_json(wb.Sheets.Combinations, { defval: '', raw: false })
const classes = comboRows.map((row) => {
  const name = row.Class
  return {
    id: slug(name),
    name,
    icon: blizzard(CLASS_ICONS[name]),
    races: {
      alliance: splitList(row['Available Races (Alliance)']),
      horde: splitList(row['Available Races (Horde)']),
    },
    specs: splitList(row.Specs).map(normalizeSpec),
    presetProfessionId: CLASS_PRESET[name],
  }
})

const races = Object.entries(RACE_ICONS).map(([name, iconId]) => ({
  id: slug(name),
  name,
  icon: blizzard(iconId),
}))

const professionPairs = buildProfessionPairs()

function sheetRows(book, name) {
  const sheet = book.Sheets[name]
  if (!sheet) return []
  return xlsx.utils.sheet_to_json(sheet, { defval: '', raw: false })
}

function parseSubRollFriction(names, raw) {
  const values = splitList(raw).map(Number)
  if (!names.length) return undefined
  const table = {}
  names.forEach((option, index) => {
    if (Number.isFinite(values[index])) table[option] = values[index]
  })
  return Object.keys(table).length ? table : undefined
}

const affixBook = xlsx.readFile(AFFIX_SOURCE)
const specFriction = Object.fromEntries(
  sheetRows(affixBook, 'Spec Friction')
    .filter((row) => row.Class && row.Spec)
    .map((row) => [`${row.Class}:${normalizeSpec(row.Spec)}`, Number(row.Friction) || 0]),
)
const professionFrictionRow = sheetRows(affixBook, 'Profession Friction')[0] ?? {}
const stackingRows = sheetRows(affixBook, 'Affix Count')
const stackingByCount = []
for (const row of stackingRows) {
  const count = Number(row.Count)
  if (!Number.isFinite(count) || count < 0) continue
  stackingByCount[count] = Number(row.Extra) || 0
}
const synergies = sheetRows(affixBook, 'Synergies')
  .filter((row) => row.Requires)
  .map((row) => ({
    id: slug(row.Requires),
    requires: splitList(row.Requires).map(slug),
    friction: Number(row.Friction) || 0,
    warning: row.Warning || '',
  }))

const specs = classes.flatMap((cls) =>
  cls.specs.map((specName) => ({
    id: `${cls.id}-${slug(specName)}`,
    classId: cls.id,
    name: specName,
    frictionScore: specFriction[`${cls.name}:${specName}`] ?? 0,
    icon: blizzard(SPEC_ICONS[`${cls.name}:${specName}`] || 'inv_misc_questionmark'),
  })),
)

function normalizeDifficulty(value) {
  return String(value).trim().toLowerCase()
}

function normalizeScope(value) {
  const key = String(value).trim().toLowerCase()
  if (key === 'spec') return 'spec'
  if (key === 'class') return 'class'
  if (key === 'universal') return 'universal'
  if (key === 'self found') return 'self-found'
  return key
}

const affixRows = xlsx.utils.sheet_to_json(affixBook.Sheets.Affixes, { defval: '', raw: false })
const affixes = affixRows
  .filter((row) => row.Affix)
  .map((row) => {
    const scope = normalizeScope(row.Category)
    const className = row.Class && row.Class !== 'All' && row.Class !== 'Self Found' ? row.Class : null
    const specsForAffix =
      scope === 'spec'
        ? splitList(String(row.Spec).replaceAll(',', ';')).map(normalizeSpec)
        : []
    const frictionValue = Number(row.Friction)
    const subRolls = splitList(row['Sub Roll'])
    const subRollFriction = parseSubRollFriction(subRolls, row['Sub Roll Friction'])
    return {
      id: slug(row.Affix),
      name: row.Affix,
      scope,
      difficulty: normalizeDifficulty(row.Difficulty),
      description: row.Description || '',
      subRolls,
      exclusionGroup: String(row['Exclusion Group'] || '').trim() || null,
      friction: Number.isFinite(frictionValue) ? frictionValue : 0,
      ...(subRollFriction ? { subRollFriction } : {}),
      rollable: scope !== 'self-found',
      className,
      specs: specsForAffix,
      icon: blizzard(
        AFFIX_ICONS[row.Affix] ||
          (scope === 'universal' || scope === 'self-found'
            ? 'inv_misc_head_dragon_01'
            : CLASS_ICONS[className] || 'inv_misc_questionmark'),
      ),
    }
  })

const catalog = {
  version: 3,
  factions: [
    {
      id: 'alliance',
      name: 'Alliance',
      tagline: 'For the Alliance.',
      icon: blizzard('inv_bannerpvp_02'),
    },
    {
      id: 'horde',
      name: 'Horde',
      tagline: 'For the Horde.',
      icon: blizzard('inv_bannerpvp_01'),
    },
  ],
  difficulties: [
    { id: 'easy', name: 'Easy', label: 'Easy', accent: 'easy', weight: 42, icon: blizzard('inv_misc_qirajicrystal_03') },
    { id: 'medium', name: 'Medium', label: 'Medium', accent: 'medium', weight: 32, icon: blizzard('inv_misc_qirajicrystal_01') },
    { id: 'hard', name: 'Hard', label: 'Hard', accent: 'hard', weight: 18, icon: blizzard('inv_misc_qirajicrystal_02') },
    { id: 'insane', name: 'Insane', label: 'Insane', accent: 'insane', weight: 8, icon: blizzard('inv_misc_qirajicrystal_05') },
  ],
  friction: {
    profession: {
      related: Number(professionFrictionRow.Related) || 8,
      alchemy: Number(professionFrictionRow.Alchemy) || 8,
      engineering: Number(professionFrictionRow.Engineering) || 0,
      unrelated: Number(professionFrictionRow.Unrelated) || 15,
    },
    ignoreProfessionIds: splitList(professionFrictionRow['Ignore Affix'] || 'Unprofessional Conduct').map(slug),
    selfFound: affixes.find((affix) => affix.id === 'self-found')?.friction ?? 0,
    stackingByCount: stackingByCount.length ? stackingByCount : [0, 0, 4, 10, 18, 28, 40, 54, 70],
    synergies,
  },
  affixCategories: [
    { id: 'universal', name: 'UNIVERSAL', label: 'Any class', icon: blizzard('inv_misc_groupneedmore') },
    { id: 'class', name: 'CLASS', label: 'Class-specific', icon: blizzard('inv_misc_book_07') },
    { id: 'spec', name: 'SPEC', label: 'Spec-specific', icon: blizzard('spell_holy_weaponmastery') },
  ],
  classes,
  races,
  specs,
  professionPairs,
  professionWeights: Object.fromEntries(
    classes.map((cls) => [
      cls.name,
      Object.fromEntries(professionPairs.map((pair) => [pair.id, professionWeight(cls.name, pair.id)])),
    ]),
  ),
  affixes,
}

fs.writeFileSync(OUT, `${JSON.stringify(catalog, null, 2)}\n`)
console.log(
  `Wrote ${catalog.classes.length} classes, ${catalog.professionPairs.length} profession pairs, ${catalog.affixes.length} affixes`,
)
