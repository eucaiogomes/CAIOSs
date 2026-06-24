import { STORAGE_KEYS } from '@/lib/constants'
import { storageGet, storageRemove, storageSet } from '@/lib/db'

export function getPersistedExplorerHermesSession(): string | null {
  return storageGet<string>(STORAGE_KEYS.explorerHermesSession)
}

export function setPersistedExplorerHermesSession(id: string | null): void {
  if (id) storageSet(STORAGE_KEYS.explorerHermesSession, id)
  else storageRemove(STORAGE_KEYS.explorerHermesSession)
}