export function weightedPick(items, rng = Math.random) {
  if (!items?.length) return null
  const total = items.reduce((sum, item) => sum + (item.weight ?? 1), 0)
  if (total <= 0) return items[Math.floor(rng() * items.length)]

  let cursor = rng() * total
  for (const item of items) {
    cursor -= item.weight ?? 1
    if (cursor <= 0) return item
  }
  return items[items.length - 1]
}

export function evenPick(items, rng = Math.random) {
  if (!items?.length) return null
  return items[Math.floor(rng() * items.length)]
}

export function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    if (!signal) return
    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    if (signal.aborted) {
      onAbort()
      return
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}
