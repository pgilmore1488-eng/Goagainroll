export function SiteFooter({ onOverlay }) {
  return (
    <footer className="mx-auto max-w-3xl px-2 pb-4 text-center">
      {onOverlay ? (
        <button
          type="button"
          onClick={onOverlay}
          className="mb-4 min-h-11 px-3 font-ui text-[11px] tracking-[0.35em] text-chrome/45 uppercase hover:text-gold"
        >
          Streamer overlay
        </button>
      ) : null}
      <p className="text-[11px] leading-relaxed text-chrome/40">
        GO AGAIN ROLL is an unofficial fan project and is not affiliated with, endorsed by, or
        sponsored by Blizzard Entertainment. World of Warcraft: Forever and Hardcore are trademarks
        of Blizzard Entertainment.
      </p>
    </footer>
  )
}