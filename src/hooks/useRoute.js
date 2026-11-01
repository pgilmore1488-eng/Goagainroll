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
  const nextPath = url.pathname.replace(/\/+$/, '') || '/'
  const nextHref = `${nextPath}${url.hash}`
  const currentHref = `${currentPath()}${window.location.hash}`
  if (nextHref === currentHref) return
  window.history.pushState(null, '', nextHref)
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
