import catalog from '../data/catalog.json'
import { SiteLink } from '../components/SiteNav.jsx'
import { FRICTION_AXES, RUN_RANKS } from '../engine/friction.js'
import { LUCKY_AFFIX_COUNTS } from '../engine/quickRoll.js'

const AXIS_TOTAL = FRICTION_AXES.reduce((sum, axis) => sum + axis.max, 0)
const STACKING = (catalog.friction.stackingByCount ?? [])
  .map((extra, count) => ({ count, extra }))
  .filter((row) => row.count >= 1)
const PROFESSION = catalog.friction.profession
const luckyTotal = LUCKY_AFFIX_COUNTS.reduce((sum, row) => sum + row.weight, 0)

export function FrictionGuide() {
  return (
    <div className="flex flex-col gap-10 text-chrome/80">
      <div className="text-center">
        <p className="font-ui text-[11px] tracking-[0.35em] text-gold-dim uppercase">Transparency</p>
        <h2 className="mt-2 font-display text-3xl font-black tracking-[0.12em] text-gold-bright uppercase">
          Friction methodology
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed">
          Friction is how hard a Forever Hardcore run is, beyond the fact that dying once ends it. The
          numbers on the roll card are not vibes. They come from the axes below, then spec, professions,
          Self Found, synergies, and affix count.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h3 className="font-display text-xl tracking-[0.12em] text-gold uppercase">An affix is five axes</h3>
        <p className="text-sm leading-relaxed">
          Each affix is scored on Time, Death, Restriction, Maintenance, and Variance. Those five
          numbers are added as written. There is no extra multiplier. Caps are {FRICTION_AXES.map((axis) => `${axis.max} ${axis.name.toLowerCase()}`).join(', ')}. A theoretical affix that maxed every axis would be {AXIS_TOTAL}.
        </p>
        <ul className="flex flex-col gap-3">
          {FRICTION_AXES.map((axis) => (
            <li key={axis.id} className="border border-gold/20 bg-black/30 px-4 py-3">
              <p className="font-ui text-[11px] tracking-[0.28em] text-gold uppercase">
                {axis.name} · max {axis.max}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{axis.meaning}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm leading-relaxed">
          Restriction is the small leftover for “you may not press this.” If a banned toy also makes you
          slower or deader, that already sits on Time and Death so we do not count it twice.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-display text-xl tracking-[0.12em] text-gold uppercase">Easy, Medium, Hard, Insane</h3>
        <p className="text-sm leading-relaxed">
          The coloured difficulty on an affix is mostly death risk: under 10 is Easy, 10–19 Medium,
          20–29 Hard, 30 and up Insane. A slow quota can still be Easy if it barely kills you. A few
          names are pinned by hand when that rule would mislabel them.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-display text-xl tracking-[0.12em] text-gold uppercase">A finished run</h3>
        <p className="text-sm leading-relaxed">
          Run friction is: affixes + spec + professions + Self Found + synergies + affix-count stacking.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            {`Self Found is ${catalog.friction.selfFound}. It is a mode, not a rollable affix. It mutexes with other Self Found-tagged rules.`}
          </li>
          <li>
            {`Professions: related ${PROFESSION.related}, Alchemy ${PROFESSION.alchemy}, Engineering ${PROFESSION.engineering}, unrelated ${PROFESSION.unrelated}. Unprofessional Conduct ignores this line.`}
          </li>
          <li>
            Specs have their own scores (healers highest, the class’s “default” spec often zero).
          </li>
          <li>
            Two affixes that hate each other add a synergy bonus. The warning on the card is that
            bonus, not a new affix.
          </li>
          <li>
            {`Stacking extra for affix count: ${STACKING.map((row) => `${row.count}=${row.extra}`).join(', ')}.`}
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-display text-xl tracking-[0.12em] text-gold uppercase">Ranks</h3>
        <ul className="flex flex-col gap-3">
          {RUN_RANKS.map((rank, index) => {
            const prev = index === 0 ? 0 : RUN_RANKS[index - 1].max + 1
            const band = rank.max === Infinity ? `${prev}+` : `${prev}–${rank.max}`
            return (
              <li key={rank.name} className="border border-gold/20 bg-black/30 px-4 py-3">
                <p className="font-ui text-[11px] tracking-[0.28em] text-gold uppercase">
                  {band} · {rank.name}
                </p>
                <p className="mt-1 text-sm leading-relaxed">{rank.description}</p>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-display text-xl tracking-[0.12em] text-gold uppercase">Feeling lucky</h3>
        <p className="text-sm leading-relaxed">
          Feeling lucky never rolls zero affixes. Count weights are{' '}
          {LUCKY_AFFIX_COUNTS.map((row) => `${row.count} affix${row.count === 1 ? '' : 'es'} ${row.weight}/${luckyTotal}`).join(', ')}.
          That mix is aimed at roughly 5 / 25 / 40 / 25 / 5 across the five ranks.
        </p>
      </section>

      <p className="text-center text-sm">
        Browse the{' '}
        <SiteLink to="/affixes" className="text-gold hover:text-gold-bright">
          affix catalogue
        </SiteLink>
        , or go back to the{' '}
        <SiteLink to="/" className="text-gold hover:text-gold-bright">
          roller
        </SiteLink>
        .
      </p>
    </div>
  )
}
