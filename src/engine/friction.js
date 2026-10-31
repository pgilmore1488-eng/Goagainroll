const BANDS = [
  { max: 10, label: 'Negligible' },
  { max: 25, label: 'Light' },
  { max: 45, label: 'Moderate' },
  { max: 65, label: 'Heavy' },
  { max: 80, label: 'Severe' },
  { max: Infinity, label: 'Extreme' },
]

const SELF_FOUND_ID = 'self-found'

export function frictionBand(score) {
  return BANDS.find((band) => score <= band.max)?.label ?? 'Extreme'
}

export function professionRelatedness(classItem, profession) {
  if (!classItem || !profession) return 'related'
  if (profession.id === 'eng-mine') return 'engineering'
  if (profession.id === 'alch-herb') return 'alchemy'
  if (profession.id === classItem.presetProfessionId) return 'related'
  return 'unrelated'
}

export function affixFriction(affix) {
  if (!affix) return 0
  const table = affix.subRollFriction ?? {}
  if (affix.subRoll && Number.isFinite(table[affix.subRoll])) return table[affix.subRoll]
  return Number.isFinite(affix.friction) ? affix.friction : 0
}

export function affixFrictionRange(affix) {
  const values = Object.values(affix?.subRollFriction ?? {}).filter((value) => Number.isFinite(value))
  if (values.length < 2) return null
  return { min: Math.min(...values), max: Math.max(...values) }
}

export function affixFrictionLabel(affix) {
  const rolled = affixFriction(affix)
  const range = affixFrictionRange(affix)
  if (!range) return String(rolled)
  if (affix?.subRoll) return `${rolled} · range ${range.min}–${range.max}`
  return `${range.min}–${range.max}`
}

function selectedAffixes(run) {
  const current = [...(run.affixes ?? [])]
  if (run.draft?.affix) current.push(run.draft.affix)
  return current
}

function ignoresProfessionScore(catalog, run) {
  const ignored = new Set(catalog.friction?.ignoreProfessionIds ?? ['unprofessional-conduct'])
  return selectedAffixes(run).some((affix) => ignored.has(affix.id))
}

function meetsRequirement(run, affixes, requirement) {
  if (requirement === SELF_FOUND_ID) return Boolean(run.selfFound)
  return affixes.some((affix) => affix.id === requirement)
}

export function matchingSynergies(catalog, run) {
  const affixes = selectedAffixes(run).filter((affix) => affix.rollable !== false)
  return (catalog.friction?.synergies ?? []).filter((synergy) => {
    const requires = synergy.requires ?? []
    return requires.length >= 2 && requires.every((requirement) => meetsRequirement(run, affixes, requirement))
  })
}

function stackingScore(catalog, count) {
  const table = catalog.friction?.stackingByCount
  if (Array.isArray(table) && table.length) {
    return table[Math.min(count, table.length - 1)] ?? 0
  }
  return count < 2 ? 0 : Math.round(count * (count - 1) * 2)
}

export function scoreRun(catalog, run) {
  const scored = selectedAffixes(run).filter((affix) => affix.rollable !== false)
  const base = scored.reduce((sum, affix) => sum + affixFriction(affix), 0)
  const specScore = run.spec?.frictionScore ?? 0
  const skipProfession = ignoresProfessionScore(catalog, run)
  const relatedness = skipProfession ? 'ignored' : professionRelatedness(run.class, run.profession)
  const professionScore = skipProfession ? 0 : (catalog.friction?.profession?.[relatedness] ?? 0)
  const selfFoundScore = run.selfFound ? (catalog.friction?.selfFound ?? 0) : 0
  const synergies = matchingSynergies(catalog, run)
  const synergyScore = synergies.reduce((sum, synergy) => sum + (synergy.friction ?? 0), 0)
  const count = scored.length
  const stacking = stackingScore(catalog, count)
  const total = base + specScore + professionScore + selfFoundScore + synergyScore + stacking
  const average = count ? Math.round(base / count) : 0

  return {
    base,
    specScore,
    professionScore,
    selfFoundScore,
    synergyScore,
    stackingScore: stacking,
    synergies,
    relatedness,
    total,
    average,
    count,
    averageLabel: frictionBand(average),
    totalLabel: frictionBand(Math.min(total, 100)),
  }
}
