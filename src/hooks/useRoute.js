import { useEffect, useState } from 'react'

export function currentPath() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path || '/'
}

export function isRollPath(path = currentPath()) {
  return path === '/' || path.startsWith('/r/')
}

export function navigate(to) {
  const url = new URL(to, window.location.origin)
  const next = url.pathname.replace(/\/+$/, '') || '/'
  if (next === currentPath()) return
  window.history.pushState(null, '', next)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function useRoute() {
  const [path, setPath] = useState(currentPath)
  useEffect(() => {
    const onPop = () => setPath(currentPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return path
}
