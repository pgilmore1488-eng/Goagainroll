import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'goagainroll-overlay'

function overlayFromSearch() {
  const value = new URLSearchParams(window.location.search).get('overlay')
  if (value === '1' || value === 'true') return true
  if (value === '0' || value === 'false') return false
  return null
}

function writeOverlayParam(on) {
  const url = new URL(window.location.href)
  if (on) url.searchParams.set('overlay', '1')
  else url.searchParams.delete('overlay')
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
}

export function useOverlay() {
  const [overlay, setOverlayState] = useState(
    () => overlayFromSearch() ?? window.localStorage.getItem(STORAGE_KEY) === '1',
  )

  const setOverlay = useCallback((next) => {
    setOverlayState((current) => {
      const value = typeof next === 'function' ? next(current) : next
      return Boolean(value)
    })
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('overlay-mode', overlay)
    window.localStorage.setItem(STORAGE_KEY, overlay ? '1' : '0')
    writeOverlayParam(overlay)
    return () => document.documentElement.classList.remove('overlay-mode')
  }, [overlay])

  return {
    overlay,
    setOverlay,
    toggleOverlay: () => setOverlay((value) => !value),
  }
}
