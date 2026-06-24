import { invoke, isTauri } from '@tauri-apps/api/core'
import type { VaultFileInfo } from '@/types/brain'

const FS_BASE = 'http://localhost:1421'

async function fsFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${FS_BASE}${path}`, init)
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? `FS error ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function writeFile(path: string, content: string): Promise<void> {
  if (isTauri()) {
    await invoke('fs_write_file', { path, content })
    return
  }
  await fsFetch('/fs/write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content }),
  })
}

export async function ensureDir(path: string): Promise<void> {
  if (isTauri()) {
    await invoke('fs_ensure_dir', { path })
    return
  }
  await fsFetch('/fs/mkdir', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  })
}

export async function deleteFile(path: string): Promise<void> {
  if (isTauri()) {
    await invoke('fs_delete_file', { path })
    return
  }
  await fsFetch('/fs/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  })
}

export async function deleteMatch(dir: string, idPrefix: string): Promise<void> {
  if (isTauri()) {
    await invoke('fs_delete_match', { dir, idPrefix })
    return
  }
  await fsFetch('/fs/delete-match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dir, idPrefix }),
  })
}

export async function scanVault(vaultPath: string): Promise<VaultFileInfo[]> {
  if (isTauri()) {
    return invoke<VaultFileInfo[]>('fs_scan_vault', { vaultPath })
  }
  const encoded = encodeURIComponent(vaultPath)
  return fsFetch<VaultFileInfo[]>(`/fs/scan?vault=${encoded}`)
}

export async function checkFsAvailable(): Promise<boolean> {
  try {
    if (isTauri()) return true
    const res = await fetch(`${FS_BASE}/fs/health`)
    return res.ok
  } catch {
    return false
  }
}