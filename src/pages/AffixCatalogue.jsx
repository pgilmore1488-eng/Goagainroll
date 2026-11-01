import { useMemo, useState } from 'react'
import catalog from '../data/catalog.json'
import { AffixHeading } from '../components/AffixHeading.jsx'
import { IconPlate } from '../components/IconPlate.jsx'
import { SiteLink } from '../components/SiteNav.jsx'
import { affixFrictionLabel } from '../engine/friction.js'

const DIFFICULTIES = catalog.difficulties
const SCOPES = catalog.affixCategories

function scopeLabel(affix) {
  if (affix.scope === 'spec') return `${affix.className} · ${(affix.specs ?? []).join(', ')}`
  if (affix.scope === 'class') return affix.className
  return 'Universal'
}

export function AffixCatalogue() {
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('all')
  const [scope, setScope] = useState('all')
  const [className, setClassName] = useState('all')

  const affixes = useMemo(
    () => catalog.affixes.filter((affix) => affix.rollable !== false),
    [],
  )

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return affixes
      .filter((affix) => (difficulty === 'all' ? true : affix.difficulty === difficulty))
      .filter((affix) => (scope === 'all' ? true : affix.scope === scope))
      .filter((affix) => (className === 'all' ? true : affix.className === className))
      .filter((affix) => {
        if (!needle) return true
        const hay = [affix.name, affix.description, affix.className, ...(affix.specs ?? []), affix.exclusionGroup]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return hay.includes(needle)
      })
      .sort((a, b) => a.name.localeCompare(b.name) || a.friction - b.friction)
  }, [affixes, className, difficulty, query, scope])

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <p className="font-ui text-[11px] tracking-[0.35em] text-gold-dim uppercase">Reference</p>
        <h2 className="mt-2 font-display text-3xl font-black tracking-[0.12em] text-gold-bright uppercase">
          Affix catalog
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-chrome/70">
          Every rollable affix, with its friction score and rules text. Mutex groups cannot be stacked.
          How the numbers are built is on the{' '}
          <SiteLink to="/friction" className="text-gold hover:text-gold-bright">
            friction
          </SiteLink>{' '}
          page.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, rule, class…"
          className="min-h-12 border border-gold/25 bg-black/40 px-4 font-ui text-sm tracking-[0.08em] text-chrome placeholder:text-chrome/30"
        />
        <FilterRow
          label="Difficulty"
          value={difficulty}
          onChange={setDifficulty}
          options={[{ id: 'all', name: 'All' }, ...DIFFICULTIES.map((item) => ({ id: item.id, name: item.name }))]}
        />
        <FilterRow
          label="Scope"
          value={scope}
          onChange={setScope}
          options={[{ id: 'all', name: 'All' }, ...SCOPES.map((item) => ({ id: item.id, name: item.name }))]}
        />
        <FilterRow
          label="Class"
          value={className}
          onChange={setClassName}
          options={[{ id: 'all', name: 'All' }, ...catalog.classes.map((item) => ({ id: item.name, name: item.name }))]}
        />
      </div>

      <p className="text-center font-ui text-[11px] tracking-[0.28em] text-chrome/40 uppercase">
        {visible.length} of {affixes.length} affixes
      </p>

      <ul className="flex flex-col gap-3">
        {visible.map((affix) => (
          <li key={affix.id} className="border border-gold/20 bg-black/30 px-4 py-4">
            <div className="flex items-start gap-3">
              <IconPlate icon={affix.icon} size="medium" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <AffixHeading affix={affix} align="left" className="text-lg sm:text-xl" />
                  <p className="font-mono text-sm text-gold">{affixFrictionLabel(affix)}</p>
                </div>
                <p className="mt-1 font-ui text-[11px] tracking-[0.22em] text-chrome/45 uppercase">
                  {affix.difficulty} · {scopeLabel(affix)}
                  {affix.exclusionGroup ? ` · mutex ${affix.exclusionGroup}` : ''}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-chrome/80">{affix.description}</p>
                {affix.subRolls?.length ? (
                  <p className="mt-2 font-ui text-[11px] tracking-[0.18em] text-gold/70 uppercase">
                    Sub roll: {affix.subRolls.join(' · ')}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FilterRow({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="w-24 shrink-0 font-ui text-[10px] tracking-[0.28em] text-gold-dim uppercase">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`min-h-10 border px-3 font-ui text-[11px] tracking-[0.22em] uppercase ${
                active ? 'border-gold bg-gold/15 text-gold' : 'border-gold/20 text-chrome/55 hover:border-gold/50 hover:text-gold'
              }`}
            >
              {option.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
