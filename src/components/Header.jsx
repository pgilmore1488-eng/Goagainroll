import { LastRollLink, SiteLink, SiteNav } from './SiteNav.jsx'

const HEADER_ACTION =
  'min-h-11 px-3 font-ui text-[11px] tracking-[0.35em] text-chrome/45 uppercase hover:text-gold'

export function Header({
  onReset,
  showReset = false,
  showLastRoll = true,
  lastRollLabel = 'Go back to your last roll',
}) {
  const lastRoll = showLastRoll ? (
    <LastRollLink className={HEADER_ACTION} label={lastRollLabel} />
  ) : null
  const reset = showReset ? (
    <button type="button" onClick={onReset} className={HEADER_ACTION}>
      Start over
    </button>
  ) : null

  return (
    <header className="flex flex-col items-center gap-2 text-center">
      <p className="font-ui text-[11px] tracking-[0.55em] text-gold-dim uppercase">
        World of Warcraft: Forever · Hardcore
      </p>
      <h1 className="font-display text-3xl font-black tracking-[0.18em] text-gold-bright sm:text-5xl">
        <SiteLink to="/" className="hover:text-gold">
          GO AGAIN ROLL
        </SiteLink>
      </h1>
      <SiteNav />
      {showReset ? (
        <div className="flex flex-wrap items-center justify-center gap-x-8">
          {lastRoll}
          {reset}
        </div>
      ) : (
        lastRoll
      )}
      <p className="mt-3 max-w-xl text-[11px] leading-relaxed text-chrome/40">
        Unofficial fan project. Not affiliated with Blizzard Entertainment.
      </p>
    </header>
  )
}
