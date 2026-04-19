const STORAGE_KEY = 'daye_custom_chips'

export function getCustomChips(screenKey) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return all[screenKey] || []
  } catch { return [] }
}

export function saveCustomChip(screenKey, chip) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const existing = all[screenKey] || []
    if (!existing.includes(chip)) {
      all[screenKey] = [...existing, chip]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    }
  } catch {}
}

export function removeCustomChip(screenKey, chip) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const updated = (all[screenKey] || []).filter(c => c !== chip)
    if (updated.length === 0) {
      delete all[screenKey]
    } else {
      all[screenKey] = updated
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {}
}

export function getAllCustomChips() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch { return {} }
}

export function clearAllCustomChips() {
  localStorage.removeItem(STORAGE_KEY)
}
