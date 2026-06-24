import { STORAGE_KEYS } from '@/lib/constants'
import { storageGet, storageRemove, storageSet } from '@/lib/db'

export function getPersistedLiveCallHermesSession(): string | null {
  return storageGet<string>(STORAGE_KEYS.liveCallHermesSession)
}

export function setPersistedLiveCallHermesSession(id: string | null): void {
  if (id) storageSet(STORAGE_KEYS.liveCallHermesSession, id)
  else storageRemove(STORAGE_KEYS.liveCallHermesSession)
}