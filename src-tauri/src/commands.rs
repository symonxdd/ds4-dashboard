use std::sync::Arc;
use tauri::{AppHandle, Manager, State};
use ds4_hid::Ds4Status;
use crate::state::{AppState, LightbarState};
use crate::icon_utils::{ALT_ICONS, BASE_ICONS, decode_ico_to_image};

/// Tauri command — returns the latest DS4 status to the frontend.
#[tauri::command]
pub fn get_ds4_status(state: State<'_, Arc<AppState>>) -> Ds4Status {
    state.status.lock().unwrap().clone()
}

/// Tauri command — updates the controller lightbar color and rumble.
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

/// Tauri command — toggles the visibility of the tray icon.
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

/// Tauri command — toggles whether the app minimizes to tray on close.
#[tauri::command]
pub fn toggle_close_to_tray(state: State<'_, Arc<AppState>>, enabled: bool) {
    let mut close_to_tray = state.close_to_tray.lock().unwrap();
    *close_to_tray = enabled;
}

/// Tauri command — toggles touchpad mouse emulation.
#[tauri::command]
pub fn toggle_mouse_emulation(state: State<'_, Arc<AppState>>, enabled: bool) {
    let mut mouse_emulation = state.mouse_emulation.lock().unwrap();
    *mouse_emulation = enabled;
}

/// Tauri command — toggles stick mouse emulation.
#[tauri::command]
pub fn toggle_stick_emulation(state: State<'_, Arc<AppState>>, enabled: bool) {
    let mut stick_emulation = state.stick_emulation.lock().unwrap();
    *stick_emulation = enabled;
}

/// Tauri command — dynamically sets the application taskbar window icon.
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
