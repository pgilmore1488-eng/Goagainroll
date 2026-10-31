import { IconPlate } from './IconPlate.jsx'

export function ChoiceButton({ icon, title, subtitle, onClick, disabled, tone = 'gold' }) {
  const tones = {
    gold: 'border-gold/40 hover:border-gold-bright hover:bg-gold/10',
    alliance: 'border-sky-400/50 hover:border-sky-300 hover:bg-sky-400/10',
    horde: 'border-red-500/50 hover:border-red-400 hover:bg-red-500/10',
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-3 border-2 bg-black/30 px-4 py-3 text-left disabled:opacity-40 ${tones[tone]}`}
    >
      {icon ? <IconPlate icon={icon} size="medium" /> : null}
      <span>
        <span className="block font-display text-lg tracking-[0.08em] text-gold-bright uppercase">{title}</span>
        {subtitle ? (
          <span className="block font-ui text-[11px] tracking-[0.18em] text-chrome/55 uppercase">{subtitle}</span>
        ) : null}
      </span>
    </button>
  )
}

export function GoldButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="gold-shine min-h-12 w-full min-w-0 rounded-sm border-2 border-gold bg-linear-to-r from-gold-dim via-gold-bright to-gold-dim px-8 py-3 font-display text-xl font-black tracking-[0.22em] text-ink uppercase disabled:opacity-40 sm:w-auto sm:min-w-56"
    >
      {children}
    </button>
  )
}
