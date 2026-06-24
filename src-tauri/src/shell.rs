use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::path::Path;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, State};

pub struct PtySession {
    writer: Arc<Mutex<Box<dyn Write + Send>>>,
    child: Arc<Mutex<Box<dyn portable_pty::Child + Send + Sync>>>,
}

pub struct PtySessions(pub Arc<Mutex<HashMap<String, PtySession>>>);

fn split_command(command: &str) -> (String, Vec<String>) {
    let parts = shell_words::split(command).unwrap_or_else(|_| {
        command.split_whitespace().map(|s| s.to_string()).collect()
    });
    if parts.is_empty() {
        return (String::new(), vec![]);
    }
    let program = parts[0].clone();
    let args = parts[1..].to_vec();
    (program, args)
}

fn apply_system_env(cmd: &mut CommandBuilder) {
    if let Ok(path) = std::env::var("PATH") {
        cmd.env("PATH", path);
    }
    if let Ok(appdata) = std::env::var("APPDATA") {
        cmd.env("APPDATA", appdata);
    }
    if let Ok(userprofile) = std::env::var("USERPROFILE") {
        cmd.env("USERPROFILE", userprofile);
    }
    if let Ok(home) = std::env::var("HOME") {
        cmd.env("HOME", home);
    }
    cmd.env("TERM", "xterm-256color");
    cmd.env("COLORTERM", "truecolor");
}

fn resolve_program(program: &str) -> String {
    if Path::new(program).exists() {
        return program.to_string();
    }
    program.to_string()
}

#[tauri::command]
pub fn pty_spawn(
    app: AppHandle,
    state: State<PtySessions>,
    session_id: String,
    command: String,
    cwd: Option<String>,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    let pty_system = native_pty_system();
    let pair = pty_system
        .openpty(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| e.to_string())?;

    let (program, args) = split_command(&command);
    if program.is_empty() {
        return Err("Comando vazio".to_string());
    }

    let resolved = resolve_program(&program);
    let mut cmd = CommandBuilder::new(&resolved);
    for arg in args {
        cmd.arg(arg);
    }
    if let Some(dir) = cwd {
        if Path::new(&dir).exists() {
            cmd.cwd(dir);
        }
    }
    apply_system_env(&mut cmd);

    let child = pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| format!("Falha ao iniciar '{}': {}", resolved, e))?;

    let mut reader = pair
        .master
        .try_clone_reader()
        .map_err(|e| e.to_string())?;
    let writer = pair.master.take_writer().map_err(|e| e.to_string())?;

    let writer_arc = Arc::new(Mutex::new(writer));
    let child_arc = Arc::new(Mutex::new(child));

    {
        let mut sessions = state.0.lock().map_err(|e| e.to_string())?;
        sessions.insert(
            session_id.clone(),
            PtySession {
                writer: Arc::clone(&writer_arc),
                child: Arc::clone(&child_arc),
            },
        );
    }

    let event_name = format!("pty-output-{}", session_id);
    let app_clone = app.clone();

    std::thread::spawn(move || {
        let mut buf = [0u8; 4096];
        loop {
            match reader.read(&mut buf) {
                Ok(0) => break,
                Ok(n) => {
                    let data = String::from_utf8_lossy(&buf[..n]).to_string();
                    let _ = app_clone.emit(&event_name, data);
                }
                Err(_) => break,
            }
        }
        let _ = app_clone.emit(&format!("pty-exit-{}", session_id), ());
    });

    Ok(())
}

#[tauri::command]
pub fn pty_write(state: State<PtySessions>, session_id: String, data: String) -> Result<(), String> {
    let sessions = state.0.lock().map_err(|e| e.to_string())?;
    let session = sessions
        .get(&session_id)
        .ok_or_else(|| format!("Sessão {} não encontrada", session_id))?;
    let mut writer = session.writer.lock().map_err(|e| e.to_string())?;
    writer
        .write_all(data.as_bytes())
        .map_err(|e| e.to_string())?;
    writer.flush().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn pty_resize(
    _state: State<PtySessions>,
    _session_id: String,
    _cols: u16,
    _rows: u16,
) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
pub fn pty_kill(state: State<PtySessions>, session_id: String) -> Result<(), String> {
    let mut sessions = state.0.lock().map_err(|e| e.to_string())?;
    if let Some(session) = sessions.remove(&session_id) {
        if let Ok(mut child) = session.child.lock() {
            let _ = child.kill();
        }
    }
    Ok(())
}