const RELATED = {
  related: 'Class professions',
  alchemy: 'Alchemy',
  engineering: 'Engineering',
  unrelated: 'Off-spec professions',
  ignored: 'No professions',
}

export function FrictionScore({ score, compact = false }) {
  if (!score) return null

  if (compact) {
    return (
      <p className="font-ui text-[11px] tracking-[0.28em] text-gold uppercase">
        Friction {score.total}
        {score.count ? ` · avg ${score.average} ${score.averageLabel}` : ''}
      </p>
    )
  }

  return (
    <section className="border border-gold/30 bg-black/30 p-5 text-center">
      <p className="font-ui text-[11px] tracking-[0.4em] text-gold-dim uppercase">Run friction</p>
      <p className="mt-2 font-display text-5xl font-black tracking-[0.08em] text-gold-bright">{score.total}</p>
      <p className="mt-1 font-ui text-sm tracking-[0.22em] text-chrome/70 uppercase">
        {score.count ? `${score.averageLabel} avg · ${score.count} affix${score.count === 1 ? '' : 'es'}` : 'No affixes'}
      </p>
      <dl className="mt-4 grid gap-2 font-mono text-[11px] text-chrome/55 uppercase sm:grid-cols-3">
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
    </section>
  )
}
