use std::net::{SocketAddr, TcpStream};
use std::process::Command;
use std::time::Duration;

use crate::cli_detect;

const DASHBOARD_HOST: &str = "127.0.0.1";
const DASHBOARD_PORT: u16 = 9119;

#[derive(serde::Serialize)]
pub struct HermesDashboardStatus {
    pub online: bool,
    pub starting: bool,
    pub error: Option<String>,
}

fn port_open() -> bool {
    let addr: SocketAddr = format!("{}:{}", DASHBOARD_HOST, DASHBOARD_PORT)
        .parse()
        .unwrap_or_else(|_| "127.0.0.1:9119".parse().unwrap());
    TcpStream::connect_timeout(&addr, Duration::from_millis(400)).is_ok()
}

fn hermes_executable() -> Option<String> {
    cli_detect::detect_hermes().map(|d| d.path)
}

#[tauri::command]
pub fn hermes_dashboard_status() -> HermesDashboardStatus {
    HermesDashboardStatus {
        online: port_open(),
        starting: false,
        error: None,
    }
}

#[tauri::command]
pub fn hermes_dashboard_start() -> Result<HermesDashboardStatus, String> {
    if port_open() {
        return Ok(HermesDashboardStatus {
            online: true,
            starting: false,
            error: None,
        });
    }

    let exe = hermes_executable().ok_or_else(|| {
        "Hermes não encontrado. Configure o caminho em Settings.".to_string()
    })?;

    let dist_index = std::env::var("LOCALAPPDATA")
        .ok()
        .map(|local| {
            std::path::PathBuf::from(local)
                .join("hermes")
                .join("hermes-agent")
                .join("hermes_cli")
                .join("web_dist")
                .join("index.html")
        });

    let mut args = vec!["dashboard", "--no-open"];
    if dist_index.as_ref().map(|p| p.exists()).unwrap_or(false) {
        args.push("--skip-build");
    }

    Command::new(&exe)
        .args(args)
        .stdin(std::process::Stdio::null())
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .spawn()
        .map_err(|e| format!("Falha ao iniciar Hermes dashboard: {}", e))?;

    Ok(HermesDashboardStatus {
        online: false,
        starting: true,
        error: None,
    })
}