import { affixFrictionLabel } from '../../engine/friction.js'
import { AffixHeading } from '../AffixHeading.jsx'
import { GoldButton } from '../ChoiceButton.jsx'
import { IconPlate } from '../IconPlate.jsx'

const ACCENT = {
  easy: 'text-easy',
  medium: 'text-medium',
  hard: 'text-hard',
  insane: 'text-insane',
}

function Box({ label, item, spinning, accent }) {
  return (
    <article className="flex min-w-0 flex-1 flex-col gap-2">
      <p className="font-ui text-[11px] tracking-[0.42em] text-gold-dim uppercase">{label}</p>
      <div
        className={`relative min-h-40 overflow-hidden border-2 bg-felt-deep px-3 py-6 text-center cabinet-frame ${
          spinning ? 'border-gold-bright' : 'border-gold/40'
        }`}
      >
        {item ? (
          <div className={`flex flex-col items-center gap-3 ${spinning ? 'reel-spinning' : ''}`}>
            <IconPlate icon={item.icon} />
            <AffixHeading affix={item} nameClassName={accent || 'text-gold-bright'} />
            {item.label && item.label !== item.name ? (
              <p className="font-ui text-[11px] tracking-[0.18em] text-chrome/55 uppercase">{item.label}</p>
            ) : null}
          </div>
        ) : (
          <p className="font-display text-4xl text-gold/20">—</p>
        )}
      </div>
    </article>
  )
}

export function AffixStep({
  draft,
  preview,
  spinning,
  buttonLabel,
  leftover,
  hasCommittedAffixes,
  onRoll,
  onAddAnother,
  onFinish,
}) {
  const complete = Boolean(draft.affix)
  const previewKey = preview?.key

  return (
    <section className="flex flex-col gap-8">
      <div className="text-center">
        <p className="font-ui text-[11px] tracking-[0.45em] text-gold-dim uppercase">Affix machine</p>
        <h2 className="font-display text-3xl font-black tracking-[0.12em] text-gold-bright">
          {complete ? 'Affix locked' : 'Click to roll the next reel'}
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Box
          label="Difficulty"
          item={previewKey === 'difficulty' ? preview.item : draft.difficulty}
          spinning={spinning && previewKey === 'difficulty'}
          accent={ACCENT[(previewKey === 'difficulty' ? preview.item : draft.difficulty)?.accent]}
        />
        <Box
          label="Category"
          item={previewKey === 'category' ? preview.item : draft.category}
          spinning={spinning && previewKey === 'category'}
        />
        <Box
          label="Affix"
          item={previewKey === 'affix' ? preview.item : draft.affix}
          spinning={spinning && previewKey === 'affix'}
        />
      </div>

      {draft.affix ? (
        <div className="border border-gold/30 bg-black/30 p-5">
          <p className="font-ui text-[11px] tracking-[0.3em] text-gold/70 uppercase">
            {draft.difficulty.label} · {draft.category.label} · {affixFrictionLabel(draft.affix)} friction
          </p>
          <div className="mt-1">
            <AffixHeading affix={draft.affix} className="text-2xl" align="left" />
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-chrome/80">{draft.affix.description}</p>
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-4">
        {buttonLabel ? (
          <div className="flex flex-col items-center gap-3">
            <GoldButton onClick={onRoll} disabled={spinning}>
              {spinning ? 'Spinning' : buttonLabel}
            </GoldButton>
            {hasCommittedAffixes && !draft.difficulty ? (
              <button
                type="button"
                onClick={onFinish}
                className="font-ui text-[11px] tracking-[0.3em] text-chrome/50 uppercase hover:text-gold"
              >
                That is enough
              </button>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            {leftover > 0 ? (
              <GoldButton onClick={onAddAnother}>Add another affix</GoldButton>
            ) : null}
            <button
              type="button"
              onClick={onFinish}
              className="border border-gold/30 px-6 py-3 font-ui text-sm tracking-[0.28em] text-chrome/80 uppercase hover:text-gold"
            >
              That is enough
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
