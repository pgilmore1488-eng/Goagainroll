import { professionIcons } from '../../engine/professions.js'
import { ChoiceButton, GoldButton } from '../ChoiceButton.jsx'
import { IconPlate, ProfessionPlates } from '../IconPlate.jsx'

export function RollOrPickStep({
  stepLabel,
  title,
  pool,
  preview,
  spinning,
  reelSpinning = false,
  onRoll,
  onPick,
  groupBy,
}) {
  const groups = groupBy
    ? Object.entries(
        pool.reduce((acc, item) => {
          const key = item.group || 'all'
          acc[key] = acc[key] || []
          acc[key].push(item)
          return acc
        }, {}),
      )
    : [['all', pool]]

  const labels = {
    preset: 'Class preset',
    universal: 'Usual pairs',
    wild: 'Wild combinations',
  }

  return (
    <section className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="font-ui text-[11px] tracking-[0.45em] text-gold-dim uppercase">{stepLabel}</p>
        <h2 className="font-display text-3xl font-black tracking-[0.12em] text-gold-bright">{title}</h2>
      </div>

      <div className="flex min-h-24 flex-col items-center justify-center gap-3">
        {preview ? (
          <div className={`flex items-center gap-3 ${reelSpinning ? 'reel-spinning' : 'place-in'}`}>
            {preview.professions?.length ? (
              <ProfessionPlates pair={preview} />
            ) : preview.icon ? (
              <IconPlate icon={preview.icon} size="large" />
            ) : null}
            <p className="font-display text-3xl font-black tracking-[0.1em] text-gold-bright uppercase">
              {preview.name}
            </p>
          </div>
        ) : (
          <GoldButton onClick={onRoll} disabled={spinning}>
            {spinning ? 'Spinning' : 'Roll'}
          </GoldButton>
        )}
        {!preview ? (
          <p className="font-ui text-[11px] tracking-[0.3em] text-chrome/45 uppercase">or pick below</p>
        ) : null}
      </div>

      <div className="flex w-full max-w-4xl flex-col gap-6">
        {groups.map(([group, items]) => {
          const body = (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ChoiceButton
                  key={item.id}
                  icon={item.icon}
                  icons={item.professions?.length ? professionIcons(item) : undefined}
                  title={item.name}
                  subtitle={item.group === 'wild' ? 'Long shot' : undefined}
                  disabled={spinning}
                  onClick={() => onPick(item)}
                />
              ))}
            </div>
          )

          if (group === 'wild') {
            return (
              <details key={group} className="border border-gold/15 bg-black/20 p-3">
                <summary className="cursor-pointer font-ui text-[10px] tracking-[0.35em] text-gold-dim uppercase">
                  Wild combinations — very long odds
                </summary>
                <div className="mt-3">{body}</div>
              </details>
            )
          }

          return (
            <div key={group}>
              {group !== 'all' ? (
                <p className="mb-2 font-ui text-[10px] tracking-[0.35em] text-gold-dim uppercase">
                  {labels[group] || group}
                </p>
              ) : null}
              {body}
            </div>
          )
        })}
      </div>
    </section>
  )
}
