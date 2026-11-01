export function Header({ onReset }) {
  return (
    <header className="flex flex-col items-center gap-2 text-center">
      <p className="font-ui text-[11px] tracking-[0.55em] text-gold-dim uppercase">
        World of Warcraft: Forever · Hardcore
      </p>
      <h1 className="font-display text-3xl font-black tracking-[0.18em] text-gold-bright sm:text-5xl">
        GO AGAIN ROLL
      </h1>
      <button
        type="button"
        onClick={onReset}
        className="min-h-11 px-3 font-ui text-[11px] tracking-[0.35em] text-chrome/45 uppercase hover:text-gold"
      >
        Start over
      </button>
      <p className="mt-3 max-w-xl text-[11px] leading-relaxed text-chrome/40">
        Unofficial fan project. Not affiliated with Blizzard Entertainment.
      </p>
    </header>
  )
}
