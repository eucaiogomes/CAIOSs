use serde::Serialize;
use std::path::PathBuf;
use std::process::Command;

#[derive(Serialize)]
pub struct CliDetection {
    pub path: String,
    pub version: Option<String>,
}

fn claude_candidate_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if let Ok(appdata) = std::env::var("APPDATA") {
        paths.push(
            PathBuf::from(appdata)
                .join("npm")
                .join("node_modules")
                .join("@anthropic-ai")
                .join("claude-code")
                .join("bin")
                .join("claude.exe"),
        );
    }

    if let Ok(home) = std::env::var("USERPROFILE").or_else(|_| std::env::var("HOME")) {
        paths.push(
            PathBuf::from(home)
                .join("AppData")
                .join("Roaming")
                .join("npm")
                .join("node_modules")
                .join("@anthropic-ai")
                .join("claude-code")
                .join("bin")
                .join("claude.exe"),
        );
    }

    paths
}

fn run_version(path: &str) -> Option<String> {
    let output = Command::new(path)
        .arg("--version")
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    let text = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if text.is_empty() {
        String::from_utf8_lossy(&output.stderr).trim().to_string().into()
    } else {
        Some(text)
    }
}

#[tauri::command]
pub fn detect_claude() -> Option<CliDetection> {
    for candidate in claude_candidate_paths() {
        if candidate.exists() {
            let path = candidate.to_string_lossy().to_string();
            let version = run_version(&path);
            return Some(CliDetection { path, version });
        }
    }

    // Fallback: where claude
    if cfg!(windows) {
        if let Ok(output) = Command::new("where").arg("claude").output() {
            if output.status.success() {
                let first = String::from_utf8_lossy(&output.stdout)
                    .lines()
                    .next()
                    .unwrap_or("")
                    .trim()
                    .to_string();
                if !first.is_empty() && PathBuf::from(&first).exists() {
                    let version = run_version(&first);
                    return Some(CliDetection {
                        path: first,
                        version,
                    });
                }
            }
        }
    }

    None
}

fn codex_candidate_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if let Ok(appdata) = std::env::var("APPDATA") {
        paths.push(
            PathBuf::from(appdata)
                .join("npm")
                .join("node_modules")
                .join("@openai")
                .join("codex")
                .join("node_modules")
                .join("@openai")
                .join("codex-win32-x64")
                .join("vendor")
                .join("x86_64-pc-windows-msvc")
                .join("bin")
                .join("codex.exe"),
        );
    }

    paths
}

#[tauri::command]
pub fn detect_codex() -> Option<CliDetection> {
    for candidate in codex_candidate_paths() {
        if candidate.exists() {
            let path = candidate.to_string_lossy().to_string();
            let version = run_version(&path);
            return Some(CliDetection { path, version });
        }
    }

    if cfg!(windows) {
        if let Ok(output) = Command::new("where").arg("codex").output() {
            if output.status.success() {
                let first = String::from_utf8_lossy(&output.stdout)
                    .lines()
                    .next()
                    .unwrap_or("")
                    .trim()
                    .to_string();
                if !first.is_empty() {
                    let version = run_version(&first);
                    return Some(CliDetection {
                        path: first,
                        version,
                    });
                }
            }
        }
    }

    None
}

fn grok_candidate_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if let Ok(home) = std::env::var("USERPROFILE").or_else(|_| std::env::var("HOME")) {
        paths.push(
            PathBuf::from(home)
                .join(".grok")
                .join("bin")
                .join("grok.exe"),
        );
    }

    paths
}

#[tauri::command]
pub fn detect_grok() -> Option<CliDetection> {
    for candidate in grok_candidate_paths() {
        if candidate.exists() {
            let path = candidate.to_string_lossy().to_string();
            let version = run_version(&path);
            return Some(CliDetection { path, version });
        }
    }

    if cfg!(windows) {
        if let Ok(output) = Command::new("where").arg("grok").output() {
            if output.status.success() {
                let first = String::from_utf8_lossy(&output.stdout)
                    .lines()
                    .next()
                    .unwrap_or("")
                    .trim()
                    .to_string();
                if !first.is_empty() {
                    let version = run_version(&first);
                    return Some(CliDetection {
                        path: first,
                        version,
                    });
                }
            }
        }
    }

    None
}

fn hermes_candidate_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if let Ok(local) = std::env::var("LOCALAPPDATA") {
        paths.push(
            PathBuf::from(local)
                .join("hermes")
                .join("hermes-agent")
                .join("venv")
                .join("Scripts")
                .join("hermes.exe"),
        );
    }

    if let Ok(home) = std::env::var("USERPROFILE").or_else(|_| std::env::var("HOME")) {
        paths.push(
            PathBuf::from(home)
                .join(".hermes")
                .join("bin")
                .join("hermes.exe"),
        );
    }

    paths
}

#[tauri::command]
pub fn detect_hermes() -> Option<CliDetection> {
    for candidate in hermes_candidate_paths() {
        if candidate.exists() {
            let path = candidate.to_string_lossy().to_string();
            let version = run_version(&path);
            return Some(CliDetection { path, version });
        }
    }

    if cfg!(windows) {
        if let Ok(output) = Command::new("where").arg("hermes").output() {
            if output.status.success() {
                let first = String::from_utf8_lossy(&output.stdout)
                    .lines()
                    .next()
                    .unwrap_or("")
                    .trim()
                    .to_string();
                if !first.is_empty() {
                    let version = run_version(&first);
                    return Some(CliDetection {
                        path: first,
                        version,
                    });
                }
            }
        }
    }

    None
}

#[tauri::command]
pub fn verify_cli(command: String) -> Result<String, String> {
    let path = command.split_whitespace().next().unwrap_or(&command);
    if !std::path::Path::new(path).exists() && !cfg!(windows) {
        return Err(format!("Caminho não encontrado: {}", path));
    }
    run_version(path).ok_or_else(|| "Falha ao executar --version".to_string())
}