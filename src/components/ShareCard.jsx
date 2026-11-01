import { forwardRef } from 'react'
import { resolveIcon } from '../engine/icons.js'
import { identityIconSlots } from '../engine/professions.js'

const FALLBACK = 'https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg'

function ShareIcon({ icon, size = 56 }) {
  return (
    <span
      className="relative inline-flex shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        border: '2px solid #c9a227',
        background: '#05060a',
        boxShadow: 'inset 0 0 0 1px #05060a',
      }}
    >
      <img
        src={resolveIcon(icon, size <= 40 ? 'medium' : 'large')}
        alt=""
        crossOrigin="anonymous"
        className="h-full w-full object-cover"
        onError={(event) => {
          if (event.currentTarget.src !== FALLBACK) event.currentTarget.src = FALLBACK
        }}
      />
    </span>
  )
}

export const ShareCard = forwardRef(function ShareCard({ run, score }, ref) {
  const count = run.affixes?.length ?? 0
  const identity = identityIconSlots(run)
  const subtitle = [
    run.faction?.name,
    run.profession?.name,
    run.selfFound ? 'Self Found' : run.selfFound === false ? 'Regular' : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <article
      ref={ref}
      className="box-border w-[720px] bg-[#040b07] px-12 py-14 text-center"
      style={{ fontFamily: 'Oswald, ui-sans-serif, system-ui, sans-serif' }}
    >
      <h1
        className="text-[42px] font-black leading-tight tracking-[0.08em] text-[#ffe89a] uppercase"
        style={{ fontFamily: 'Cinzel, ui-serif, Georgia, serif' }}
      >
        {run.race?.name} {run.spec?.name} {run.class?.name}
      </h1>
      <p
        className="mt-3 text-[16px] tracking-[0.22em] text-[#d7dde8]/80 uppercase"
        style={{ fontFamily: 'Oswald, ui-sans-serif, sans-serif' }}
      >
        {subtitle}
      </p>

      <div className="mt-10 flex justify-center gap-3">
        {identity.map((item) => (
          <ShareIcon key={item.key} icon={item.icon} />
        ))}
      </div>
      <p
        className="mt-4 text-[14px] tracking-[0.32em] text-[#e8c547] uppercase"
        style={{ fontFamily: 'Oswald, ui-sans-serif, sans-serif' }}
      >
        {count === 1 ? '1 affix' : `${count} affixes`}
      </p>

      <p
        className="mt-12 text-[13px] tracking-[0.4em] text-[#8a6d1f] uppercase"
        style={{ fontFamily: 'Oswald, ui-sans-serif, sans-serif' }}
      >
        Run friction
      </p>
      <p
        className="mt-2 text-[84px] font-black leading-none tracking-[0.06em] text-[#ffe89a]"
        style={{ fontFamily: 'Cinzel, ui-serif, Georgia, serif' }}
      >
        {score?.total ?? 0}
      </p>
      <p
        className="mt-4 text-[22px] font-black tracking-[0.12em] text-[#ffe89a] uppercase"
        style={{ fontFamily: 'Cinzel, ui-serif, Georgia, serif' }}
      >
        {score?.rank?.name}
      </p>

      {count ? (
        <ul className="mt-12 flex flex-col gap-5 text-left">
          {run.affixes.map((affix, index) => (
            <li key={`${affix.id}-${index}`} className="flex items-center gap-4">
              <ShareIcon icon={affix.icon} size={40} />
              <div>
                <p
                  className="text-[22px] font-black tracking-[0.1em] text-[#ffe89a] uppercase"
                  style={{ fontFamily: 'Cinzel, ui-serif, Georgia, serif' }}
                >
                  {affix.name}
                </p>
                {affix.subRoll ? (
                  <p
                    className="mt-1 text-[12px] tracking-[0.28em] text-[#e8c547] uppercase"
                    style={{ fontFamily: 'Oswald, ui-sans-serif, sans-serif' }}
                  >
                    {affix.subRoll}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p
          className="mt-12 text-[14px] tracking-[0.22em] text-[#d7dde8]/50 uppercase"
          style={{ fontFamily: 'Oswald, ui-sans-serif, sans-serif' }}
        >
          No affixes. Clean living.
        </p>
      )}

      <p
        className="mt-14 text-[12px] tracking-[0.22em] text-[#8a6d1f] uppercase"
        style={{ fontFamily: 'Oswald, ui-sans-serif, sans-serif' }}
      >
        A World of Warcraft: Forever Hardcore challenge from goagainroll.com
      </p>
    </article>
  )
})
