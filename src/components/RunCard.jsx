import { useState } from 'react'
import catalog from '../data/catalog.json'
import { affixFrictionLabel, scoreRun } from '../engine/friction.js'
import { SLOT_LABELS } from '../engine/quickRoll.js'
import { canNativeShare, copyText, shareUrl, summarizeRun } from '../engine/share.js'
import { AffixHeading } from './AffixHeading.jsx'
import { GoldButton } from './ChoiceButton.jsx'
import { FrictionScore } from './FrictionScore.jsx'
import { IconPlate } from './IconPlate.jsx'

function EmptyPlate() {
  return (
    <span className="inline-flex h-14 w-14 items-center justify-center border-2 border-dashed border-gold/25 bg-black/20 font-display text-xl text-gold/25">
      —
    </span>
  )
}

function IdentitySlot({ item, placing }) {
  if (!item) return <EmptyPlate />
  return (
    <span className={placing ? 'place-in inline-flex' : 'inline-flex'}>
      <IconPlate icon={item.icon} />
    </span>
  )
}

export function RunCard({ run, center = null, placing = null, revealScore = false, onReset, onSkip }) {
  const [copied, setCopied] = useState('')
  const complete = Boolean(run.faction && run.class && run.spec && run.race && run.profession && revealScore)
  const link = complete ? shareUrl(run) : ''
  const score = complete ? scoreRun(catalog, run) : null
  const titleReady = run.race || run.spec || run.class

  async function copy(kind) {
    const value = kind === 'link' ? link : summarizeRun(run, catalog)
    try {
      await copyText(value)
      setCopied(kind)
    } catch {
      setCopied('failed')
    }
  }

  async function shareNative() {
    try {
      await navigator.share({
        title: 'GO AGAIN ROLL',
        text: summarizeRun(run, catalog),
        url: link,
      })
    } catch (error) {
      if (error?.name !== 'AbortError') await copy('link')
    }
  }

  return (
    <section className="relative flex flex-col gap-8">
      {onSkip && !revealScore ? (
        <div className="sticky top-2 z-20 flex justify-center">
          <button
            type="button"
            onClick={onSkip}
            className="min-h-12 border border-gold/40 bg-black/80 px-6 py-3 font-ui text-sm tracking-[0.28em] text-gold uppercase hover:border-gold-bright hover:text-gold-bright"
          >
            Skip animations
          </button>
        </div>
      ) : null}
      {center ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-24 sm:items-center sm:pt-0">
          <div
            className={`border-2 border-gold-bright bg-felt-deep px-8 py-6 text-center shadow-[0_0_40px_rgba(232,197,71,0.25)] ${
              center.spinning ? 'reel-spinning' : 'place-in'
            }`}
          >
            <p className="font-ui text-[11px] tracking-[0.35em] text-gold uppercase">
              {center.spinning ? 'Rolling' : 'Locked'} {SLOT_LABELS[center.key] || center.key}
            </p>
            <div className="mt-3 flex flex-col items-center gap-3">
              {center.item?.icon ? <IconPlate icon={center.item.icon} /> : null}
              <p className="font-display text-2xl font-black tracking-[0.12em] text-gold-bright uppercase">
                {center.item?.name ?? '—'}
              </p>
              {center.item?.subRoll ? (
                <p className="font-ui text-sm tracking-[0.28em] text-gold uppercase">{center.item.subRoll}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="text-center">
        <p className="font-ui text-[11px] tracking-[0.45em] text-gold-dim uppercase">Your run</p>
        <h2
          className={`font-display text-3xl font-black tracking-[0.12em] ${
            titleReady ? 'text-gold-bright' : 'text-gold/25'
          } ${placing === 'race' || placing === 'spec' || placing === 'class' ? 'place-in' : ''}`}
        >
          {run.race?.name ?? '—'} {run.spec?.name ?? '—'} {run.class?.name ?? '—'}
        </h2>
        <p
          className={`mt-2 font-ui tracking-[0.2em] uppercase ${run.faction || run.profession || run.selfFound ? 'text-chrome/70' : 'text-chrome/25'} ${
            placing === 'faction' || placing === 'profession' || placing === 'selfFound' ? 'place-in' : ''
          }`}
        >
          {run.faction?.name ?? '—'} · {run.profession?.name ?? '—'}
          {run.selfFound ? ' · Self Found' : run.selfFound === false && !revealScore ? ' · Open world' : ''}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <IdentitySlot item={run.faction} placing={placing === 'faction'} />
        <IdentitySlot item={run.class} placing={placing === 'class'} />
        <IdentitySlot item={run.spec} placing={placing === 'spec'} />
        <IdentitySlot item={run.race} placing={placing === 'race'} />
        <IdentitySlot item={run.profession} placing={placing === 'profession'} />
      </div>

      {revealScore && score ? (
        <div className="place-in">
          <FrictionScore score={score} />
        </div>
      ) : (
        <section className="border border-dashed border-gold/20 bg-black/20 p-5 text-center">
          <p className="font-ui text-[11px] tracking-[0.4em] text-gold-dim uppercase">Run friction</p>
          <p className="mt-2 font-display text-5xl font-black tracking-[0.08em] text-gold/20">???</p>
          <p className="mt-1 font-ui text-sm tracking-[0.22em] text-chrome/40 uppercase">Sealed until the last reel</p>
        </section>
      )}

      {revealScore && score?.synergies.length ? (
        <ul className="place-in flex flex-col gap-2 border border-gold/20 bg-black/30 p-4 text-left">
          <li className="font-ui text-[11px] tracking-[0.28em] text-gold uppercase">Synergy adders</li>
          {score.synergies.map((synergy) => (
            <li key={synergy.id} className="text-sm leading-relaxed text-chrome/80">
              <span className="font-mono text-gold-bright">+{synergy.friction}</span> {synergy.warning}
            </li>
          ))}
        </ul>
      ) : null}

      {run.affixes.length ? (
        <ul className="flex flex-col gap-3">
          {run.affixes.map((affix, index) => (
            <li
              key={`${affix.id}-${index}`}
              className={`flex gap-3 border border-gold/20 bg-black/30 p-4 ${
                placing === `affix:${affix.id}` || (placing === 'affix' && index === run.affixes.length - 1)
                  ? 'place-in'
                  : ''
              }`}
            >
              <IconPlate icon={affix.icon} size="medium" />
              <div>
                <p className="font-ui text-[11px] tracking-[0.25em] text-gold/70 uppercase">
                  {affix.difficulty} · {affix.scope}
                  {revealScore ? ` · ${affixFrictionLabel(affix)} friction` : ''}
                </p>
                <AffixHeading affix={affix} className="text-xl" align="left" />
                <p className="mt-1 text-sm leading-relaxed text-chrome/80">{affix.description}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : revealScore ? (
        <p className="place-in text-center font-ui tracking-[0.2em] text-chrome/50 uppercase">No affixes. Clean living.</p>
      ) : (
        <p className="text-center font-ui tracking-[0.2em] text-chrome/25 uppercase">Affixes pending</p>
      )}

      {complete ? (
        <>
          {run.shareNotice ? (
            <p className="place-in border border-gold/30 bg-black/40 px-4 py-3 text-center text-sm leading-relaxed text-chrome/80">
              {run.shareNotice.missing.length
                ? 'This link is from an older ruleset. Some affixes could not be matched and were dropped.'
                : 'This link is from an older ruleset. Affixes were updated to the current names.'}
            </p>
          ) : null}

          <div className="place-in flex flex-col gap-3">
            <span className="block text-center font-ui text-[10px] tracking-[0.35em] text-gold-dim uppercase">
              Share link · tap to copy
            </span>
            <button
              type="button"
              onClick={() => copy('link')}
              className="min-h-12 w-full truncate border border-gold/25 bg-black/40 px-3 py-3 text-left font-mono text-xs text-chrome/80"
            >
              {copied === 'link' ? 'Copied to clipboard' : copied === 'failed' ? 'Copy failed. Long-press the address bar instead.' : link}
            </button>
          </div>

          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {canNativeShare() ? (
              <GoldButton onClick={shareNative}>Share</GoldButton>
            ) : (
              <GoldButton onClick={() => copy('link')}>
                {copied === 'link' ? 'Link copied' : 'Copy share link'}
              </GoldButton>
            )}
            <button
              type="button"
              onClick={() => copy('text')}
              className="min-h-12 border border-gold/30 px-6 py-3 font-ui text-sm tracking-[0.28em] text-chrome/80 uppercase hover:text-gold"
            >
              {copied === 'text' ? 'Summary copied' : 'Copy summary'}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="min-h-12 border border-gold/30 px-6 py-3 font-ui text-sm tracking-[0.28em] text-chrome/80 uppercase hover:text-gold"
            >
              Roll another
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
