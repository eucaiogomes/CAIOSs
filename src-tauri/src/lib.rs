mod cli_detect;
mod commands;
mod database;
mod filesystem;
mod hermes;
mod shell;

use shell::PtySessions;
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(PtySessions(Arc::new(Mutex::new(HashMap::new()))))
        .invoke_handler(tauri::generate_handler![
            commands::open_path,
            commands::open_url,
            commands::open_internal_webview,
            commands::pick_folder,
            shell::pty_spawn,
            shell::pty_write,
            shell::pty_resize,
            shell::pty_kill,
            database::init_db,
            cli_detect::detect_claude,
            cli_detect::detect_codex,
            cli_detect::detect_grok,
            cli_detect::detect_hermes,
            cli_detect::verify_cli,
            hermes::hermes_dashboard_status,
            hermes::hermes_dashboard_start,
            filesystem::fs_write_file,
            filesystem::fs_ensure_dir,
            filesystem::fs_delete_file,
            filesystem::fs_delete_match,
            filesystem::fs_scan_vault,
        ])
        .run(tauri::generate_context!())
        .expect("error while running CaiOS");
}