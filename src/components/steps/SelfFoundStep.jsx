import { GoldButton } from '../ChoiceButton.jsx'
import { IconPlate } from '../IconPlate.jsx'

const CHOICES = [
  { label: 'Self Found', value: true },
  { label: 'Regular', value: false },
]

export function SelfFoundStep({ onChoose, onRoll, preview, spinning, reelSpinning = false }) {
  return (
    <section className="flex flex-col items-center gap-6 text-center">
      <p className="font-ui text-[11px] tracking-[0.45em] text-gold-dim uppercase">Step 01</p>
      <h2 className="font-display text-3xl font-black tracking-[0.12em] text-gold-bright">
        Self Found or Regular?
      </h2>
      <p className="max-w-lg font-ui text-sm tracking-[0.12em] text-chrome/70 uppercase">
        No auction house, no trading, no mail from other characters. Everything you use, you earned.
      </p>
      {preview ? (
        <div className={`flex items-center gap-3 ${reelSpinning ? 'reel-spinning' : 'place-in'}`}>
          <IconPlate icon={preview.icon} size="large" />
          <p className="font-display text-3xl font-black tracking-[0.1em] text-gold-bright uppercase">
            {preview.name}
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-4">
          {CHOICES.map((choice) => (
            <button
              key={choice.label}
              type="button"
              disabled={spinning}
              onClick={() => onChoose(choice.value)}
              className="min-h-12 min-w-32 border-2 border-gold/40 bg-black/30 px-8 py-3 font-display text-xl font-black tracking-[0.22em] text-gold-bright uppercase hover:border-gold-bright hover:bg-gold/10 disabled:opacity-40"
            >
              {choice.label}
            </button>
          ))}
          <GoldButton onClick={onRoll} disabled={spinning}>
            Roll
          </GoldButton>
        </div>
      )}
    </section>
  )
}
