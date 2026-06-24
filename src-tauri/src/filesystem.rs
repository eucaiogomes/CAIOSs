use regex::Regex;
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VaultFileInfo {
    pub path: String,
    pub title: String,
    pub links: Vec<String>,
    pub tags: Vec<String>,
    pub folder: String,
}

fn parse_markdown_file(full_path: &Path, vault_root: &Path) -> Option<VaultFileInfo> {
    let raw = fs::read_to_string(full_path).ok()?;
    let base = full_path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("nota")
        .to_string();

    let rel = full_path
        .strip_prefix(vault_root)
        .ok()?
        .to_string_lossy()
        .replace('\\', "/");

    let folder = Path::new(&rel)
        .parent()
        .and_then(|p| p.to_str())
        .unwrap_or("")
        .replace('\\', "/");

    let mut title = base.clone();
    if let Some(cap) = Regex::new(r"(?m)^#\s+(.+)$").ok()?.captures(&raw) {
        title = cap.get(1)?.as_str().trim().to_string();
    }

    let wikilink_re = Regex::new(r"\[\[([^|\]#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]").ok()?;
    let tag_re = Regex::new(r"(?:^|\s)#([a-zA-Z0-9_\-/]+)").ok()?;

    let mut links = Vec::new();
    for cap in wikilink_re.captures_iter(&raw) {
        let link = cap.get(1)?.as_str().trim().to_string();
        if !link.is_empty() && !links.contains(&link) {
            links.push(link);
        }
    }

    let mut tags = Vec::new();
    for cap in tag_re.captures_iter(&raw) {
        let tag = cap.get(1)?.as_str().trim().to_string();
        if !tag.is_empty() && !tags.contains(&tag) {
            tags.push(tag);
        }
    }

    Some(VaultFileInfo {
        path: full_path.to_string_lossy().replace('\\', "/"),
        title,
        links,
        tags,
        folder,
    })
}

fn walk_vault(dir: &Path, vault_root: &Path, results: &mut Vec<VaultFileInfo>, depth: u8) {
    if depth > 12 {
        return;
    }
    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };

    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with('.') {
            continue;
        }
        let path = entry.path();
        if path.is_dir() {
            if name == ".obsidian" || name == "node_modules" {
                continue;
            }
            walk_vault(&path, vault_root, results, depth + 1);
        } else if path.extension().and_then(|e| e.to_str()) == Some("md") {
            if let Some(info) = parse_markdown_file(&path, vault_root) {
                results.push(info);
            }
        }
    }
}

#[tauri::command]
pub async fn fs_write_file(path: String, content: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    if let Some(parent) = p.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&p, content).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn fs_ensure_dir(path: String) -> Result<(), String> {
    fs::create_dir_all(PathBuf::from(path)).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn fs_delete_file(path: String) -> Result<(), String> {
    let p = PathBuf::from(path);
    if p.exists() {
        fs::remove_file(p).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn fs_delete_match(dir: String, id_prefix: String) -> Result<(), String> {
    let dir_path = PathBuf::from(dir);
    if !dir_path.exists() {
        return Ok(());
    }
    let needle = format!("({})", id_prefix);
    for entry in fs::read_dir(dir_path).map_err(|e| e.to_string())?.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        if name.ends_with(".md") && name.contains(&needle) {
            let _ = fs::remove_file(entry.path());
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn fs_scan_vault(vault_path: String) -> Result<Vec<VaultFileInfo>, String> {
    let root = PathBuf::from(&vault_path);
    if !root.exists() {
        return Err("Vault inválido ou inexistente".into());
    }
    let mut results = Vec::new();
    walk_vault(&root, &root, &mut results, 0);
    Ok(results)
}