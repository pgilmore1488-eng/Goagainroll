import { RunCard } from '../RunCard.jsx'

export function DoneStep({ run, onReset }) {
  return <RunCard run={run} revealScore onReset={onReset} />
}
