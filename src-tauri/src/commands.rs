use std::fs;
use std::sync::Arc;
use tauri::{webview::Color, AppHandle, Manager, State};
use ds4_hid::Ds4Status;
use crate::state::{AppState, LightbarState};
use crate::icon_utils::{ALT_ICONS, BASE_ICONS, decode_ico_to_image};

const START_MINIMIZED_FILE: &str = "start_minimized.flag";
const THEME_PREFERENCE_FILE: &str = "theme_preference.flag";

// Must match --bg-app in src/theme.css for each theme.
const LIGHT_BG: Color = Color(243, 243, 243, 255);
const DARK_BG: Color = Color(6, 6, 6, 255);

/// Reads the persisted theme preference from disk and returns the matching window background
/// color, so the native window can be painted with the correct color *before* it's ever shown
/// -- avoiding a flash of the wrong theme's color that a purely CSS/JS-driven fix can't prevent,
/// since Rust has no access to the webview's localStorage at window-creation time otherwise.
pub fn theme_background_color(app_handle: &AppHandle) -> Color {
    let is_light = app_handle
        .path()
        .app_config_dir()
        .map(|dir| fs::read_to_string(dir.join(THEME_PREFERENCE_FILE)).ok())
        .ok()
        .flatten()
        .map(|s| s.trim() == "light")
        .unwrap_or(false);

    if is_light { LIGHT_BG } else { DARK_BG }
}

/// Tauri command -- persists the resolved ("dark"/"light", never "system_default") theme
/// preference so it's readable on next launch, before the webview exists.
#[tauri::command]
pub fn set_theme_preference(app_handle: AppHandle, theme: String) -> Result<(), String> {
    let dir = app_handle.path().app_config_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    fs::write(dir.join(THEME_PREFERENCE_FILE), theme).map_err(|e| e.to_string())
}

/// Reads the persisted "start minimized" preference from disk. This must be read from disk
/// (rather than the frontend's localStorage) because it needs to be known during `.setup()`,
/// before the webview -- and therefore localStorage -- exists.
pub fn start_minimized_preference(app_handle: &AppHandle) -> bool {
    app_handle
        .path()
        .app_config_dir()
        .map(|dir| dir.join(START_MINIMIZED_FILE).exists())
        .unwrap_or(false)
}

/// Tauri command -- persists the "start minimized" preference so it's readable on next launch.
#[tauri::command]
pub fn set_start_minimized(app_handle: AppHandle, enabled: bool) -> Result<(), String> {
    let dir = app_handle.path().app_config_dir().map_err(|e| e.to_string())?;
    let path = dir.join(START_MINIMIZED_FILE);

    if enabled {
        fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
        fs::write(path, b"1").map_err(|e| e.to_string())
    } else if path.exists() {
        fs::remove_file(path).map_err(|e| e.to_string())
    } else {
        Ok(())
    }
}

/// Tauri command: returns the latest DS4 status to the frontend.
#[tauri::command]
pub fn get_ds4_status(state: State<'_, Arc<AppState>>) -> Ds4Status {
    state.status.lock().unwrap().clone()
}

/// Tauri command: updates the controller lightbar color and rumble.
#[tauri::command]
pub fn set_output_state(
    state: State<'_, Arc<AppState>>,
    r: u8,
    g: u8,
    b: u8,
    small_rumble: u8,
    large_rumble: u8,
) -> Result<(), String> {
    let device_lock = state.device.lock().unwrap();
    let info_lock = state.device_info.lock().unwrap();

    if let (Some(device), Some(info)) = (&*device_lock, &*info_lock) {
        let is_bt = matches!(info.bus_type(), hidapi::BusType::Bluetooth);

        // Save state for auto-reapply
        let mut last_state = state.last_state.lock().unwrap();
        *last_state = Some(LightbarState { r, g, b, small_rumble, large_rumble });

        ds4_hid::set_output_state(device, r, g, b, small_rumble, large_rumble, is_bt)
    } else {
        // Even if no device, save it for when one connects
        let mut last_state = state.last_state.lock().unwrap();
        *last_state = Some(LightbarState { r, g, b, small_rumble, large_rumble });
        Ok(())
    }
}

/// Tauri command: toggles the visibility of the tray icon.
#[tauri::command]
pub fn toggle_tray_icon(
    app_handle: AppHandle,
    state: State<'_, Arc<AppState>>,
    visible: bool,
) -> Result<(), String> {
    let mut tray_visible = state.tray_visible.lock().unwrap();

    // Only update if the state is actually changing
    if *tray_visible != visible {
        if let Some(tray) = app_handle.tray_by_id("ds4-tray") {
            tray.set_visible(visible)
                .map_err(|e| format!("Failed to set tray visibility: {}", e))?;
            *tray_visible = visible;
        } else {
            return Err("Tray icon not found".into());
        }
    }
    Ok(())
}

/// Tauri command: toggles whether the app minimizes to tray on close.
#[tauri::command]
pub fn toggle_close_to_tray(state: State<'_, Arc<AppState>>, enabled: bool) {
    let mut close_to_tray = state.close_to_tray.lock().unwrap();
    *close_to_tray = enabled;
}

/// Tauri command: toggles touchpad mouse emulation.
#[tauri::command]
pub fn toggle_mouse_emulation(state: State<'_, Arc<AppState>>, enabled: bool) {
    let mut mouse_emulation = state.mouse_emulation.lock().unwrap();
    *mouse_emulation = enabled;
}

/// Tauri command: toggles stick mouse emulation.
#[tauri::command]
pub fn toggle_stick_emulation(state: State<'_, Arc<AppState>>, enabled: bool) {
    let mut stick_emulation = state.stick_emulation.lock().unwrap();
    *stick_emulation = enabled;
}

/// Tauri command: dynamically sets the application taskbar window icon.
#[tauri::command]
pub fn set_app_icon(app_handle: AppHandle, id: String) -> Result<(), String> {
    let window = app_handle
        .get_webview_window("main")
        .ok_or("Main window not found")?;

    // Dynamic lookup: Convert "modern_wired" -> "app-icon-modern-wired.ico"
    let bytes = if id == "default" {
        BASE_ICONS
            .get_file("icon.ico")
            .map(|f| f.contents())
            .ok_or("Default icon not found")?
    } else {
        // We look for "{id}.ico", replacing underscores with hyphens to match filename best practices
        let filename = format!("{}.ico", id.replace("_", "-"));
        ALT_ICONS
            .get_file(&filename)
            .map(|f| f.contents())
            .ok_or_else(|| format!("Icon file '{}' not found in embedded storage", filename))?
    };

    let icon = decode_ico_to_image(bytes)?;
    window.set_icon(icon).map_err(|e| e.to_string())?;
    Ok(())
}
