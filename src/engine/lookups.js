import { evenPick, weightedPick } from './weighted.js'

export function getClass(catalog, classId) {
  return catalog.classes.find((item) => item.id === classId) ?? null
}

export function getRace(catalog, raceIdOrName) {
  return (
    catalog.races.find((item) => item.id === raceIdOrName || item.name === raceIdOrName) ?? null
  )
}

export function getSpec(catalog, classId, specName) {
  return (
    catalog.specs.find((item) => item.classId === classId && item.name === specName) ?? null
  )
}

export function getProfession(catalog, pairId) {
  return catalog.professionPairs.find((item) => item.id === pairId) ?? null
}

export function racesFor(catalog, classItem, factionId) {
  const names = classItem?.races?.[factionId] ?? []
  return names.map((name) => getRace(catalog, name)).filter(Boolean)
}

export function specsFor(catalog, classItem) {
  return (classItem?.specs ?? [])
    .map((name) => getSpec(catalog, classItem.id, name))
    .filter(Boolean)
}

export function professionChoices(catalog, classItem) {
  const weights = catalog.professionWeights[classItem.name] ?? {}
  return catalog.professionPairs
    .map((pair) => ({
      ...pair,
      weight: weights[pair.id] ?? 0.2,
      group:
        pair.id === classItem.presetProfessionId
          ? 'preset'
          : pair.id === 'eng-mine' || pair.id === 'alch-herb'
            ? 'universal'
            : 'wild',
    }))
    .sort((a, b) => b.weight - a.weight)
}

export function affixApplies(affix, className, specName) {
  if (affix.scope === 'universal') return true
  if (affix.scope === 'class') return affix.className === className
  if (affix.scope === 'spec') return affix.className === className && affix.specs.includes(specName)
  return false
}

export function subRollOptions(affix) {
  return (affix?.subRolls ?? affix?.conditions ?? [])
    .map((option) => String(option).trim())
    .filter(Boolean)
}

export function resolveSubRoll(affix) {
  if (!affix) return affix
  const options = subRollOptions(affix)
  return {
    ...affix,
    subRoll: options.length ? evenPick(options) : null,
  }
}

export function occupiedExclusionGroups(run) {
  const groups = new Set()
  if (run.selfFound) groups.add('Self Found')
  const selected = [...(run.affixes ?? [])]
  if (run.draft?.affix) selected.push(run.draft.affix)
  for (const affix of selected) {
    if (affix?.exclusionGroup) groups.add(affix.exclusionGroup)
  }
  return groups
}

export function remainingAffixes(catalog, run) {
  const used = new Set((run.affixes ?? []).map((item) => item.id))
  if (run.draft?.affix?.id) used.add(run.draft.affix.id)
  if (!run.class || !run.spec) return []
  const groups = occupiedExclusionGroups(run)
  return catalog.affixes.filter((affix) => {
    if (affix.rollable === false) return false
    if (used.has(affix.id)) return false
    if (!affixApplies(affix, run.class.name, run.spec.name)) return false
    if (affix.exclusionGroup && groups.has(affix.exclusionGroup)) return false
    return true
  })
}

export function affixesFor(catalog, run, difficultyId, categoryId) {
  return remainingAffixes(catalog, run).filter(
    (affix) => affix.difficulty === difficultyId && affix.scope === categoryId,
  )
}

export function viableCategories(catalog, run, difficultyId) {
  return catalog.affixCategories.filter(
    (category) => affixesFor(catalog, run, difficultyId, category.id).length > 0,
  )
}

export function viableDifficulties(catalog, run) {
  return catalog.difficulties.filter(
    (difficulty) => viableCategories(catalog, run, difficulty.id).length > 0,
  )
}

export function rollAffix(catalog, run) {
  const viable = viableDifficulties(catalog, run)
  if (!viable.length) return null
  const difficulty = weightedPick(viable)
  if (!difficulty) return null
  const category = pickUntil(catalog.affixCategories, (item) =>
    viableCategories(catalog, run, difficulty.id).some((row) => row.id === item.id),
  )
  if (!category) return null
  const pool = affixesFor(catalog, run, difficulty.id, category.id)
  if (!pool.length) return null
  return resolveSubRoll(evenPick(pool))
}

export function pickUntil(pool, isValid, rng = Math.random, attempts = 40) {
  if (!pool.length) return null
  let picked = null
  for (let i = 0; i < attempts; i += 1) {
    picked = pool[Math.floor(rng() * pool.length)]
    if (isValid(picked)) return picked
  }
  return pool.find(isValid) ?? null
}
