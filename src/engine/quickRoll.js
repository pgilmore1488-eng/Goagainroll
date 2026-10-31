import {
  getClass,
  getProfession,
  getRace,
  professionChoices,
  racesFor,
  rollAffix,
  specsFor,
} from './lookups.js'
import { evenPick, weightedPick } from './weighted.js'

export const SLOT_LABELS = {
  selfFound: 'Self Found',
  faction: 'Faction',
  class: 'Class',
  spec: 'Spec',
  race: 'Race',
  profession: 'Professions',
  affixCount: 'Affix count',
  affix: 'Affix',
}

export function selfFoundDisplay(catalog, selfFound) {
  const affix = catalog.affixes.find((item) => item.id === 'self-found')
  if (selfFound) {
    return { id: 'self-found-yes', name: 'Self Found', icon: affix?.icon ?? null }
  }
  return {
    id: 'self-found-no',
    name: 'Open world',
    icon: { source: 'blizzard', id: 'inv_misc_groupneedmore' },
  }
}

export function affixCountDisplay(count) {
  return {
    id: `affix-count-${count}`,
    name: count === 1 ? '1 affix' : `${count} affixes`,
  }
}

function isSet(value) {
  return value !== '' && value != null
}

function classesForRace(catalog, race, factionId) {
  if (!race) return catalog.classes
  return catalog.classes.filter((cls) => {
    if (factionId) return (cls.races?.[factionId] ?? []).includes(race.name)
    return Object.values(cls.races ?? {}).some((names) => names.includes(race.name))
  })
}

function factionsFor(classItem, race) {
  const ids = Object.keys(classItem?.races ?? {})
  return ids.filter((factionId) => {
    const names = classItem.races[factionId] ?? []
    return names.length && (!race || names.includes(race.name))
  })
}

export function resolveQuickRun(catalog, picks = {}, options = {}) {
  const lucky = Boolean(options.lucky)
  const wanted = {
    selfFound: !lucky && isSet(picks.selfFound),
    faction: !lucky && isSet(picks.factionId),
    class: !lucky && isSet(picks.classId),
    spec: !lucky && isSet(picks.specId),
    race: !lucky && isSet(picks.raceId),
    profession: !lucky && isSet(picks.professionId),
    affixCount: !lucky && isSet(picks.affixCount),
  }

  let spec = wanted.spec ? catalog.specs.find((item) => item.id === picks.specId) : null
  let classItem = wanted.class ? getClass(catalog, picks.classId) : null
  let race = wanted.race ? getRace(catalog, picks.raceId) : null
  let faction = wanted.faction ? catalog.factions.find((item) => item.id === picks.factionId) : null
  let profession = wanted.profession ? getProfession(catalog, picks.professionId) : null

  if (spec) classItem = getClass(catalog, spec.classId) ?? classItem

  if (race && classItem) {
    const valid = factionsFor(classItem, race)
    if (!valid.length) race = null
  }

  if (!classItem) {
    const pool = classesForRace(catalog, race, faction?.id)
    classItem = evenPick(pool.length ? pool : catalog.classes)
  }

  if (!faction) {
    const ids = factionsFor(classItem, race)
    const pool = catalog.factions.filter((item) => ids.includes(item.id))
    faction = evenPick(pool.length ? pool : catalog.factions)
  }

  const specPool = specsFor(catalog, classItem)
  if (!spec || spec.classId !== classItem.id) spec = evenPick(specPool)

  const racePool = racesFor(catalog, classItem, faction.id)
  if (!race || !racePool.some((item) => item.id === race.id)) race = evenPick(racePool)

  const professionPool = professionChoices(catalog, classItem)
  if (!profession) profession = weightedPick(professionPool)

  const selfFound = wanted.selfFound ? picks.selfFound === 'yes' : evenPick([true, false])

  const affixCount = wanted.affixCount
    ? Number(picks.affixCount)
    : lucky
      ? weightedPick([
          { count: 1, weight: 30 },
          { count: 2, weight: 30 },
          { count: 3, weight: 18 },
          { count: 4, weight: 10 },
          { count: 5, weight: 12 },
        ]).count
      : evenPick([0, 1, 2, 3, 4, 5])

  const locked = {
    selfFound: wanted.selfFound,
    faction: wanted.faction && faction?.id === picks.factionId,
    class: (wanted.class && classItem?.id === picks.classId) || wanted.spec,
    spec: wanted.spec && spec?.id === picks.specId,
    race: wanted.race && race?.id === picks.raceId,
    profession: wanted.profession && profession?.id === picks.professionId,
    affixCount: wanted.affixCount,
  }

  const run = {
    faction,
    class: classItem,
    spec,
    race,
    profession,
    selfFound,
    affixes: [],
  }

  for (let i = 0; i < affixCount; i += 1) {
    const affix = rollAffix(catalog, run)
    if (!affix) break
    run.affixes.push(affix)
  }

  return { run, locked, affixCount: run.affixes.length, requestedCount: affixCount }
}

export function buildQuickSequence(catalog, resolved) {
  const { run, locked, requestedCount } = resolved
  const sequence = [
    {
      key: 'selfFound',
      item: run.selfFound,
      display: selfFoundDisplay(catalog, run.selfFound),
      locked: locked.selfFound,
      pool: [selfFoundDisplay(catalog, true), selfFoundDisplay(catalog, false)],
    },
    { key: 'faction', item: run.faction, display: run.faction, locked: locked.faction, pool: catalog.factions },
    { key: 'class', item: run.class, display: run.class, locked: locked.class, pool: catalog.classes },
    { key: 'spec', item: run.spec, display: run.spec, locked: locked.spec, pool: specsFor(catalog, run.class) },
    { key: 'race', item: run.race, display: run.race, locked: locked.race, pool: racesFor(catalog, run.class, run.faction.id) },
    {
      key: 'profession',
      item: run.profession,
      display: run.profession,
      locked: locked.profession,
      pool: professionChoices(catalog, run.class),
    },
  ]

  const counts =
    requestedCount >= 1 && requestedCount <= 5 && run.affixes.length > 0 ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5]
  sequence.push({
    key: 'affixCount',
    item: run.affixes.length,
    display: affixCountDisplay(run.affixes.length),
    locked: locked.affixCount,
    pool: counts.map(affixCountDisplay),
  })

  for (const affix of run.affixes) {
    sequence.push({
      key: 'affix',
      item: affix,
      display: affix,
      locked: false,
      pool: catalog.affixes.filter((item) => item.rollable !== false),
    })
  }

  return sequence
}
