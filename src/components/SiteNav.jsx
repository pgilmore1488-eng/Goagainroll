import { isRollPath, navigate, useRoute } from '../hooks/useRoute.js'

const LINKS = [
  { to: '/', label: 'Roll', match: isRollPath },
  { to: '/affixes', label: 'Affixes', match: (path) => path === '/affixes' },
  { to: '/friction', label: 'Friction', match: (path) => path === '/friction' },
]

export function SiteLink({ to, children, className = '' }) {
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
        event.preventDefault()
        navigate(to)
      }}
    >
      {children}
    </a>
  )
}

export function SiteNav() {
  const path = useRoute()
  return (
    <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Site">
      {LINKS.map((link) => {
        const active = link.match(path)
        return (
          <SiteLink
            key={link.to}
            to={link.to}
            className={`min-h-11 px-1 font-ui text-[11px] tracking-[0.35em] uppercase ${
              active ? 'text-gold' : 'text-chrome/45 hover:text-gold'
            }`}
          >
            {link.label}
          </SiteLink>
        )
      })}
    </nav>
  )
}
