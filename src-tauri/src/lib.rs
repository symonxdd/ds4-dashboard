mod tray_icon;
use ds4_hid::{Connection, Ds4Status};
use hidapi::HidApi;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::{
    menu::{MenuBuilder, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, State,
};

#[derive(Clone, Copy)]
struct LightbarState {
    r: u8,
    g: u8,
    b: u8,
    small_rumble: u8,
    large_rumble: u8,
}

/// Shared application state
struct AppState {
    status: Mutex<Ds4Status>,
    device: Mutex<Option<hidapi::HidDevice>>,
    device_info: Mutex<Option<hidapi::DeviceInfo>>,
    tray_visible: Mutex<bool>,
    close_to_tray: Mutex<bool>,
    last_state: Mutex<Option<LightbarState>>,
}

/// Tauri command — returns the latest DS4 status to the frontend.
#[tauri::command]
fn get_ds4_status(state: State<'_, Arc<AppState>>) -> Ds4Status {
    state.status.lock().unwrap().clone()
}

/// Tauri command — updates the controller lightbar color and rumble.
#[tauri::command]
fn set_output_state(
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
fn toggle_tray_icon(
    app_handle: tauri::AppHandle,
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
fn toggle_close_to_tray(state: State<'_, Arc<AppState>>, enabled: bool) {
    let mut close_to_tray = state.close_to_tray.lock().unwrap();
    *close_to_tray = enabled;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = Arc::new(AppState {
        status: Mutex::new(Ds4Status::disconnected()),
        device: Mutex::new(None),
        device_info: Mutex::new(None),
        tray_visible: Mutex::new(true), // Now starts ON by default
        close_to_tray: Mutex::new(false), // Start disabled by default
        last_state: Mutex::new(None),
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .manage(app_state.clone())
        .invoke_handler(tauri::generate_handler![
            get_ds4_status,
            set_output_state,
            toggle_tray_icon,
            toggle_close_to_tray
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let state = window.state::<Arc<AppState>>();
                let close_to_tray = state.close_to_tray.lock().unwrap();
                let tray_visible = state.tray_visible.lock().unwrap();

                // Only minimize to tray if the setting is ON AND the tray icon is actually visible
                if *close_to_tray && *tray_visible {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .setup(move |app| {
            // ── System Tray ──────────────────────────────────────
            let show = MenuItem::with_id(app, "show", "Show Dashboard", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = MenuBuilder::new(app)
                .item(&show)
                .separator()
                .item(&quit)
                .build()?;

            let _tray = TrayIconBuilder::with_id("ds4-tray")
                .tooltip("DS4 Dashboard — Scanning...")
                .icon(tray_icon::generate_battery_icon(0, false, false))
                .menu(&menu)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                })
                .build(app)?;

            // ── Background Polling Thread ────────────────────────
            let app_handle = app.handle().clone();
            let state = app_state;

            thread::spawn(move || {
                loop {
                    let status = {
                        let mut device_lock = state.device.lock().unwrap();
                        let mut info_lock = state.device_info.lock().unwrap();
                        let mut status_lock = state.status.lock().unwrap();

                        // If not connected, try to find and open a device
                        if device_lock.is_none() {
                            // Re-initialize HidApi context to refresh device list on Windows
                            if let Ok(api) = HidApi::new() {
                                if let Some(info) = ds4_hid::find_ds4(&api) {
                                    if let Ok(device) = info.open_device(&api) {
                                        let is_bt = matches!(info.bus_type(), hidapi::BusType::Bluetooth);
                                        
                                        // 1. One-time BT handshake
                                        if is_bt {
                                            let _ = ds4_hid::send_bt_handshake(&device);
                                        }

                                        // 2. Auto-apply last state
                                        let last = state.last_state.lock().unwrap();
                                        if let Some(s) = *last {
                                            let _ = ds4_hid::set_output_state(
                                                &device,
                                                s.r,
                                                s.g,
                                                s.b,
                                                s.small_rumble,
                                                s.large_rumble,
                                                is_bt,
                                            );
                                        }

                                        *info_lock = Some(info);
                                        *device_lock = Some(device);
                                    }
                                }
                            }
                        }

                        // Read status if we have a device
                        let s = if let (Some(device), Some(info)) = (&*device_lock, &*info_lock) {
                            let res = ds4_hid::read_status(device, info);
                            if !res.connected {
                                // Connection lost
                                *device_lock = None;
                                *info_lock = None;
                            }
                            res
                        } else {
                            Ds4Status::disconnected()
                        };

                        *status_lock = s.clone();
                        s
                    };

                    // Update Tray (Locks are already released here)
                    let raw_pixels = tray_icon::generate_battery_icon_raw(
                        status.battery,
                        status.charging,
                        status.connected,
                    );

                    if let Some(tray) = app_handle.tray_by_id("ds4-tray") {
                        let tooltip = if status.connected {
                            let conn = match status.connection {
                                Some(Connection::Bluetooth) => "BT",
                                Some(Connection::Usb) => "USB",
                                None => "?",
                            };
                            let charge = if status.charging { " ⚡" } else { "" };
                            format!("DS4: {}% · {}{}", status.battery, conn, charge)
                        } else {
                            "No controller connected".into()
                        };
                        let _ = tray.set_tooltip(Some(&tooltip));

                        let image = tauri::image::Image::new_owned(raw_pixels, 32, 32);
                        let _ = tray.set_icon(Some(image));
                    }

                    let _ = app_handle.emit("ds4-status-update", &status);

                    // The thread sleeps for 1 second WITHOUT holding any locks.
                    thread::sleep(Duration::from_secs(1));
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
