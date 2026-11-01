import { useMemo, useState } from 'react'
import catalog from '../data/catalog.json'
import { getClass, racesFor, specsFor } from '../engine/lookups.js'
import { GoldButton } from './ChoiceButton.jsx'

const EMPTY = {
  selfFound: '',
  factionId: '',
  classId: '',
  specId: '',
  raceId: '',
  professionId: '',
  affixCount: '',
}

function Select({ label, value, onChange, children }) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-left">
      <span className="font-ui text-[10px] tracking-[0.28em] text-gold-dim uppercase">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 border border-gold/30 bg-black/50 px-3 py-2 font-ui text-sm tracking-[0.08em] text-gold-bright uppercase"
      >
        {children}
      </select>
    </label>
  )
}

export function QuickRollPanel({ onQuickRoll, onLucky }) {
  const [picks, setPicks] = useState(EMPTY)

  const classItem = picks.classId ? getClass(catalog, picks.classId) : null
  const factionId = picks.factionId || null

  const specOptions = useMemo(() => {
    if (classItem) return specsFor(catalog, classItem)
    return catalog.specs
  }, [classItem])

  const raceOptions = useMemo(() => {
    if (classItem && factionId) return racesFor(catalog, classItem, factionId)
    if (classItem) {
      const seen = new Map()
      for (const id of Object.keys(classItem.races ?? {})) {
        for (const race of racesFor(catalog, classItem, id)) seen.set(race.id, race)
      }
      return [...seen.values()]
    }
    if (factionId) {
      const seen = new Map()
      for (const cls of catalog.classes) {
        for (const race of racesFor(catalog, cls, factionId)) seen.set(race.id, race)
      }
      return [...seen.values()]
    }
    return catalog.races
  }, [classItem, factionId])

  function update(key, value) {
    setPicks((current) => {
      const next = { ...current, [key]: value }
      if (key === 'classId') {
        const cls = getClass(catalog, value)
        const specs = cls ? specsFor(catalog, cls).map((item) => item.id) : []
        if (next.specId && !specs.includes(next.specId)) next.specId = ''
        const raceIds = new Set()
        if (cls) {
          for (const id of next.factionId ? [next.factionId] : Object.keys(cls.races ?? {})) {
            for (const race of racesFor(catalog, cls, id)) raceIds.add(race.id)
          }
        }
        if (next.raceId && raceIds.size && !raceIds.has(next.raceId)) next.raceId = ''
      }
      if (key === 'factionId' && next.raceId) {
        const cls = getClass(catalog, next.classId)
        if (cls && value) {
          const valid = new Set(racesFor(catalog, cls, value).map((item) => item.id))
          if (!valid.has(next.raceId)) next.raceId = ''
        }
      }
      if (key === 'specId' && value) {
        const spec = catalog.specs.find((item) => item.id === value)
        if (spec) next.classId = spec.classId
      }
      return next
    })
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="text-center">
        <p className="font-ui text-[11px] tracking-[0.45em] text-gold-dim uppercase">Feeling impatient?</p>
        <h2 className="font-display text-3xl font-black tracking-[0.12em] text-gold-bright">Quick roll</h2>
        <p className="mt-2 font-ui text-sm tracking-[0.12em] text-chrome/65 uppercase">
          Lock in what you already want and roll the rest
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select label="Self Found" value={picks.selfFound} onChange={(value) => update('selfFound', value)}>
          <option value="">Roll</option>
          <option value="yes">Self Found</option>
          <option value="no">Regular</option>
        </Select>
        <Select label="Faction" value={picks.factionId} onChange={(value) => update('factionId', value)}>
          <option value="">Roll</option>
          {catalog.factions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        <Select label="Class" value={picks.classId} onChange={(value) => update('classId', value)}>
          <option value="">Roll</option>
          {catalog.classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        <Select label="Spec" value={picks.specId} onChange={(value) => update('specId', value)}>
          <option value="">Roll</option>
          {specOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {classItem ? item.name : `${catalog.classes.find((cls) => cls.id === item.classId)?.name} ${item.name}`}
            </option>
          ))}
        </Select>
        <Select label="Race" value={picks.raceId} onChange={(value) => update('raceId', value)}>
          <option value="">Roll</option>
          {raceOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        <Select label="Professions" value={picks.professionId} onChange={(value) => update('professionId', value)}>
          <option value="">Roll</option>
          {catalog.professionPairs.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        <Select label="Affixes" value={picks.affixCount} onChange={(value) => update('affixCount', value)}>
          <option value="">Roll</option>
          {[0, 1, 2, 3, 4, 5].map((count) => (
            <option key={count} value={String(count)}>
              {count === 1 ? '1 affix' : `${count} affixes`}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col items-center gap-3">
        <GoldButton onClick={() => onQuickRoll(picks)}>Quick roll</GoldButton>
        <button
          type="button"
          onClick={() => setPicks(EMPTY)}
          className="min-h-11 px-3 font-ui text-[11px] tracking-[0.28em] text-chrome/45 uppercase hover:text-gold"
        >
          Clear locks
        </button>
      </div>

      <div className="flex flex-col items-center gap-3 pt-4">
        <button
          type="button"
          onClick={onLucky}
          className="min-h-12 w-full border border-gold/40 px-6 py-3 font-display text-lg tracking-[0.2em] text-gold-bright uppercase hover:border-gold-bright hover:bg-gold/10 sm:w-auto"
        >
          Feeling lucky?
        </button>
        <p className="font-ui text-[11px] tracking-[0.18em] text-chrome/45 uppercase">
          Pure random · 1 to 5 affixes, weighted toward fewer
        </p>
      </div>
    </section>
  )
}
