use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_dialog::DialogExt;

#[tauri::command]
pub async fn open_path(path: String) -> Result<(), String> {
    tauri_plugin_opener::open_path(&path, None::<&str>).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn open_url(url: String) -> Result<(), String> {
    tauri_plugin_opener::open_url(&url, None::<&str>).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn open_internal_webview(
    app: AppHandle,
    url: String,
    title: String,
) -> Result<(), String> {
    let label = format!(
        "webtool-{}",
        url.chars().filter(|c| c.is_alphanumeric()).take(12).collect::<String>()
    );

    if let Some(window) = app.get_webview_window(&label) {
        window.set_focus().map_err(|e| e.to_string())?;
        return Ok(());
    }

    let parsed = url.parse().map_err(|e: url::ParseError| e.to_string())?;

    WebviewWindowBuilder::new(&app, &label, WebviewUrl::External(parsed))
        .title(&title)
        .inner_size(1100.0, 750.0)
        .resizable(true)
        .build()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn pick_folder(app: AppHandle) -> Result<Option<String>, String> {
    let path = app
        .dialog()
        .file()
        .set_title("Selecionar pasta do projeto")
        .blocking_pick_folder();

    Ok(path.map(|p| p.to_string()))
}