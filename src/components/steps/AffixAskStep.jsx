import { GoldButton } from '../ChoiceButton.jsx'

export function AffixAskStep({ leftover, onYes, onNo }) {
  return (
    <section className="flex flex-col items-center gap-6 text-center">
      <p className="font-ui text-[11px] tracking-[0.45em] text-gold-dim uppercase">Step 07</p>
      <h2 className="font-display text-3xl font-black tracking-[0.12em] text-gold-bright">
        Roll an affix?
      </h2>
      <p className="max-w-lg font-ui text-sm tracking-[0.12em] text-chrome/70 uppercase">
        Difficulty, then category, then the contract. You can stack more after this one.
      </p>
      <p className="font-mono text-xs text-chrome/45">{leftover} still in the deck</p>
      <div className="flex flex-wrap justify-center gap-4">
        <GoldButton onClick={onYes}>Roll an affix</GoldButton>
        <button
          type="button"
          onClick={onNo}
          className="border border-gold/30 px-6 py-3 font-ui text-sm tracking-[0.28em] text-chrome/70 uppercase hover:text-gold"
        >
          Skip — lock it in
        </button>
      </div>
    </section>
  )
}
