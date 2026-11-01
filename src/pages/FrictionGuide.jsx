import catalog from '../data/catalog.json'
import { SiteLink } from '../components/SiteNav.jsx'
import { FRICTION_AXES, RUN_RANKS } from '../engine/friction.js'
import { LUCKY_AFFIX_COUNTS } from '../engine/quickRoll.js'

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
          Friction measures how hard or tedious a Forever Hardcore run is, beyond the fact that dying
          once ends it. The numbers on the roll card are not vibes. They come from adding the affix
          scores calculated as below, then additional friction based on spec, professions, Self Found,
          synergies, and the number of affixes.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h3 className="font-display text-xl tracking-[0.12em] text-gold uppercase">How an affix is scored</h3>
        <p className="text-sm leading-relaxed">
          Each affix is scored on Time, Death, Restriction, Maintenance, and Variance and their sum
          forms the total score out of 100.
          <br />
          The maximum score contribution for each is Time 30; Death 30; Restriction 10; Maintenance
          15; and Variance 15.
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
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-display text-xl tracking-[0.12em] text-gold uppercase">Easy, Medium, Hard, Insane</h3>
        <p className="text-sm leading-relaxed">
          The colored difficulty on an affix relates to death risk and not the friction. The
          difficulty relation to death risk is: under 10 is Easy, 10–19 Medium, 20–29 Hard, 30
          Insane. A time consuming affix can still be Easy if it barely kills you.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-display text-xl tracking-[0.12em] text-gold uppercase">Total Run Score</h3>
        <p className="text-sm leading-relaxed">
          Run friction is: sum of affix scores + spec + professions + Self Found + synergies +
          affix-count stacking.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            {`Self Found is ${catalog.friction.selfFound}. It is a mode, not a rollable affix. It is mutually exclusive with other Self Found-tagged rules.`}
          </li>
          <li>
            {`Professions: Engineering and Mining gives no extra friction. Alchemy and Herbalism, along with standard primary/secondary profession pairings for the class (e.g. BS/Mining for warrior) give ${PROFESSION.related} friction. All other combinations give ${PROFESSION.unrelated}. This is mutually exclusive with Unprofessional Conduct.`}
          </li>
          <li>
            Specs have their own scores, with healers higher due to the additional time to level, and
            default leveling spec options lower. BM hunters are the baseline zero.
          </li>
          <li>
            Two affixes that hate each other add a synergy bonus. The warning on the card is that
            bonus, not a new affix. For example if one affix doesn’t let you use quest rewards and
            you’re playing Self Found, you’re relying only on drops for your gear.
          </li>
          <li>
            {`Stacking extra for affix count: ${STACKING.map((row) => `${row.count}=${row.extra}`).join(', ')}. You can roll more than 8 if you want, but we take no responsibility for any emotional damage caused.`}
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
          Feeling lucky never rolls zero affixes. Affix count weights are{' '}
          {`${LUCKY_AFFIX_COUNTS.map((row) => {
            const pct = Math.round((row.weight / luckyTotal) * 100)
            return `${row.count} affix${row.count === 1 ? '' : 'es'} ${pct}%`
          }).join(', ')}.`}{' '}
          That mix results in a distribution across the 5 ranks of roughly 5% / 25% / 40% / 25% /
          5%, so be wary that feeling lucky runs are still going to be a challenge.
        </p>
      </section>

      <p className="text-center text-sm">
        Browse the{' '}
        <SiteLink to="/affixes" className="text-gold hover:text-gold-bright">
          affix catalog
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
