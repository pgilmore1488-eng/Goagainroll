import { resolveIcon } from '../engine/icons.js'

const FALLBACK = 'https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg'

export function IconPlate({ icon, size = 'large', className = '' }) {
  const px = size === 'tiny' ? 28 : size === 'medium' ? 40 : 56
  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-[4px] border-2 border-gold/80 bg-ink shadow-[inset_0_0_0_1px_#05060a] ${className}`}
      style={{ width: px, height: px }}
    >
      <img
        src={resolveIcon(icon, size === 'tiny' ? 'medium' : 'large')}
        alt=""
        crossOrigin="anonymous"
        className="h-full w-full object-cover"
        onError={(event) => {
          if (event.currentTarget.src !== FALLBACK) event.currentTarget.src = FALLBACK
        }}
      />
      <span className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/20 to-transparent" />
    </span>
  )
}
