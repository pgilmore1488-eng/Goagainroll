import { GoldButton } from '../ChoiceButton.jsx'

export function SelfFoundStep({ onChoose }) {
  return (
    <section className="flex flex-col items-center gap-6 text-center">
      <p className="font-ui text-[11px] tracking-[0.45em] text-gold-dim uppercase">Step 01</p>
      <h2 className="font-display text-3xl font-black tracking-[0.12em] text-gold-bright">Self Found?</h2>
      <p className="max-w-lg font-ui text-sm tracking-[0.12em] text-chrome/70 uppercase">
        This is not rolled. If you take it, auction house and trade affixes stay out of the deck.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <GoldButton onClick={() => onChoose(true)}>Play Self Found</GoldButton>
        <button
          type="button"
          onClick={() => onChoose(false)}
          className="border border-gold/30 px-6 py-3 font-ui text-sm tracking-[0.28em] text-chrome/70 uppercase hover:text-gold"
        >
          Open world
        </button>
      </div>
    </section>
  )
}
