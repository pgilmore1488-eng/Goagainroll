import { RunCard } from '../RunCard.jsx'

export function DoneStep({ run, overlay = false, onReset }) {
  if (run.shareLoading) {
    return (
      <p className="py-16 text-center font-ui text-sm tracking-[0.28em] text-gold uppercase">
        Loading shared run
      </p>
    )
  }
  return <RunCard run={run} revealScore overlay={overlay} onReset={onReset} />
}
