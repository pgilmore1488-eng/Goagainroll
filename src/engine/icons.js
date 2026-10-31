const ZAM_BASE = 'https://wow.zamimg.com/images/wow/icons'

const FALLBACK_ICON = 'inv_misc_questionmark'

export function resolveIcon(icon, size = 'large') {
  if (!icon) {
    return `${ZAM_BASE}/${size}/${FALLBACK_ICON}.jpg`
  }

  if (icon.source === 'local') {
    return icon.path
  }

  if (icon.source === 'blizzard') {
    const safeSize = size === 'tiny' || size === 'medium' ? size : 'large'
    return `${ZAM_BASE}/${safeSize}/${icon.id || FALLBACK_ICON}.jpg`
  }

  return icon.path || `${ZAM_BASE}/${size}/${FALLBACK_ICON}.jpg`
}

export function blizzardIcon(id) {
  return { source: 'blizzard', id }
}

export function localIcon(path) {
  return { source: 'local', path }
}
