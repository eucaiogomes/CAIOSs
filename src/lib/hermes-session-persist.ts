const STORAGE_KEY = 'caios_hermes_active_session'

export function getPersistedHermesSession(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setPersistedHermesSession(id: string | null): void {
  try {
    if (id) sessionStorage.setItem(STORAGE_KEY, id)
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}