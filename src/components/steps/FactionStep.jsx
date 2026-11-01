import { ChoiceButton, GoldButton } from '../ChoiceButton.jsx'
import { IconPlate } from '../IconPlate.jsx'

export function FactionStep({ factions, onChoose, onRoll, preview, spinning, reelSpinning = false }) {
  return (
    <section className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="font-ui text-[11px] tracking-[0.45em] text-gold-dim uppercase">Step 02</p>
        <h2 className="font-display text-3xl font-black tracking-[0.12em] text-gold-bright">
          Choose your faction
        </h2>
      </div>
      {preview ? (
        <div className={`flex items-center gap-3 ${reelSpinning ? 'reel-spinning' : 'place-in'}`}>
          <IconPlate icon={preview.icon} size="large" />
          <p className="font-display text-3xl font-black tracking-[0.1em] text-gold-bright uppercase">
            {preview.name}
          </p>
        </div>
      ) : (
        <>
          <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
            {factions.map((faction) => (
              <ChoiceButton
                key={faction.id}
                icon={faction.icon}
                title={faction.name}
                subtitle={faction.tagline}
                tone={faction.id}
                disabled={spinning}
                onClick={() => onChoose(faction)}
              />
            ))}
          </div>
          <GoldButton onClick={onRoll} disabled={spinning}>
            Roll
          </GoldButton>
        </>
      )}
    </section>
  )
}
