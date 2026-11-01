const KEY = 'goagainroll:last-run'
export const LAST_RUN_EVENT = 'goagainroll:last-run'

export function saveLastRunToken(token) {
  if (!token) return
  try {
    localStorage.setItem(KEY, token)
    window.dispatchEvent(new Event(LAST_RUN_EVENT))
  } catch {
    // Private mode or blocked storage should not break the roller.
  }
}

export function readLastRunToken() {
  try {
    return localStorage.getItem(KEY) || ''
  } catch {
    return ''
  }
}
