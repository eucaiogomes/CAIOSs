/**
 * Storage abstraction layer.
 * MVP uses localStorage; swap implementations here when Tauri + SQLite is ready.
 */

export interface StorageAdapter {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
}

class LocalStorageAdapter implements StorageAdapter {
  get<T>(key: string): T | null {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
  }

  remove(key: string): void {
    localStorage.removeItem(key)
  }
}

// Future: TauriSQLiteAdapter via invoke('db_query', ...)
let adapter: StorageAdapter = new LocalStorageAdapter()

export function setStorageAdapter(newAdapter: StorageAdapter) {
  adapter = newAdapter
}

export function storageGet<T>(key: string): T | null {
  return adapter.get<T>(key)
}

export function storageSet<T>(key: string, value: T): void {
  adapter.set(key, value)
}

export function storageRemove(key: string): void {
  adapter.remove(key)
}