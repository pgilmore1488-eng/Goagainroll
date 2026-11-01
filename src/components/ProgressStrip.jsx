import catalog from '../data/catalog.json'
import { scoreRun } from '../engine/friction.js'
import { FrictionScore } from './FrictionScore.jsx'
import { IconPlate } from './IconPlate.jsx'

function Chip({ icon, label, sub }) {
  return (
    <div className="flex items-center gap-2 border border-gold/20 bg-black/35 px-2 py-1">
      {icon ? <IconPlate icon={icon} size="tiny" /> : null}
      <div className="min-w-0">
        <p className="truncate font-ui text-[10px] tracking-[0.18em] text-gold-bright uppercase">{label}</p>
        {sub ? <p className="truncate font-mono text-[9px] text-chrome/45 uppercase">{sub}</p> : null}
      </div>
    </div>
  )
}

export function ProgressStrip({ run }) {
  const chips = []
  if (run.faction) chips.push({ icon: run.faction.icon, label: run.faction.name })
  if (run.class) chips.push({ icon: run.class.icon, label: run.class.name })
  if (run.spec) chips.push({ icon: run.spec.icon, label: run.spec.name })
  if (run.race) chips.push({ icon: run.race.icon, label: run.race.name })
  if (run.profession) chips.push({ icon: run.profession.icon, label: run.profession.name })
  if (run.selfFound) chips.push({ label: 'Self Found', sub: 'locked in' })
  else if (run.selfFound === false) chips.push({ label: 'Regular', sub: 'locked in' })
  for (const affix of run.affixes ?? []) {
    chips.push({
      icon: affix.icon,
      label: affix.name,
      sub: affix.subRoll || [affix.difficulty, affix.scope].filter(Boolean).join(' · '),
    })
  }

  if (!chips.length) return null

  return (
    <section className="border border-gold/20 bg-black/25 p-3">
      <p className="mb-2 font-ui text-[10px] tracking-[0.4em] text-gold-dim uppercase">Locked in</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {chips.map((chip, index) => (
            <Chip key={`${chip.label}-${index}`} {...chip} />
          ))}
        </div>
        {run.spec && run.profession ? <FrictionScore score={scoreRun(catalog, run)} compact /> : null}
      </div>
    </section>
  )
}
