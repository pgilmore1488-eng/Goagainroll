import { useState } from 'react'
import { SiteLink } from './SiteNav.jsx'

const RELATED = {
  related: 'Class professions',
  alchemy: 'Alchemy',
  engineering: 'Engineering',
  unrelated: 'Off-spec professions',
  ignored: 'No professions',
}

export function FrictionScore({ score, compact = false }) {
  const [open, setOpen] = useState(false)
  if (!score) return null

  if (compact) {
    return (
      <p className="font-ui text-[11px] tracking-[0.28em] text-gold uppercase">
        Friction {score.total}
        {score.rank ? ` · ${score.rank.name}` : ''}
      </p>
    )
  }

  return (
    <section className="border border-gold/30 bg-black/30 text-center">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="w-full p-5 hover:bg-gold/5"
      >
        <p className="font-ui text-[11px] tracking-[0.4em] text-gold-dim uppercase">Run friction</p>
        <p className="mt-2 font-display text-5xl font-black tracking-[0.08em] text-gold-bright">{score.total}</p>
        <p className="mt-3 font-display text-xl font-black tracking-[0.1em] text-gold-bright uppercase">
          {score.rank.name}
        </p>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-chrome/75">
          {score.rank.description}
        </p>
        <p className="mt-3 font-ui text-[10px] tracking-[0.28em] text-gold/60 uppercase">
          {open ? 'Hide breakdown' : 'Tap for breakdown'}
        </p>
      </button>
      {open ? (
        <div className="border-t border-gold/20 px-5 pb-5 pt-4">
          <dl className="grid gap-2 font-mono text-[11px] text-chrome/55 uppercase sm:grid-cols-3">
            <div>
              <dt>Affixes</dt>
              <dd className="text-gold-bright">{score.base}</dd>
            </div>
            <div>
              <dt>Spec</dt>
              <dd className="text-gold-bright">+{score.specScore}</dd>
            </div>
            <div>
              <dt>{RELATED[score.relatedness] || 'Professions'}</dt>
              <dd className="text-gold-bright">+{score.professionScore}</dd>
            </div>
            <div>
              <dt>Self Found</dt>
              <dd className="text-gold-bright">+{score.selfFoundScore}</dd>
            </div>
            <div>
              <dt>Synergy</dt>
              <dd className="text-gold-bright">+{score.synergyScore}</dd>
            </div>
            <div>
              <dt>Affix count</dt>
              <dd className="text-gold-bright">+{score.stackingScore}</dd>
            </div>
          </dl>
          {score.synergies?.length ? (
            <ul className="mt-4 flex flex-col gap-2 border-t border-gold/15 pt-4 text-left">
              <li className="font-ui text-[11px] tracking-[0.28em] text-gold uppercase">Synergy adders</li>
              {score.synergies.map((synergy) => (
                <li key={synergy.id} className="text-sm leading-relaxed text-chrome/80 normal-case">
                  <span className="font-mono text-gold-bright">+{synergy.friction}</span> {synergy.warning}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-4">
            <SiteLink
              to="/friction"
              className="font-ui text-[11px] tracking-[0.28em] text-gold/70 uppercase hover:text-gold"
            >
              What is friction?
            </SiteLink>
          </p>
        </div>
      ) : null}
    </section>
  )
}
