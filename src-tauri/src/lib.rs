mod tray_icon;
use ds4_hid::{Ds4Status, Connection};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::{
    menu::{MenuBuilder, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, State,
};
use hidapi::HidApi;

/// Shared application state
struct AppState {
    status: Mutex<Ds4Status>,
    device: Mutex<Option<hidapi::HidDevice>>,
    device_info: Mutex<Option<hidapi::DeviceInfo>>,
}

/// Tauri command — returns the latest DS4 status to the frontend.
#[tauri::command]
fn get_ds4_status(state: State<'_, Arc<AppState>>) -> Ds4Status {
    state.status.lock().unwrap().clone()
}

/// Tauri command — updates the controller lightbar color.
#[tauri::command]
fn set_lightbar(state: State<'_, Arc<AppState>>, r: u8, g: u8, b: u8) -> Result<(), String> {
    let device_lock = state.device.lock().unwrap();
    let info_lock = state.device_info.lock().unwrap();

    if let (Some(device), Some(info)) = (&*device_lock, &*info_lock) {
        let is_bt = matches!(info.bus_type(), hidapi::BusType::Bluetooth);
        ds4_hid::set_lightbar(device, r, g, b, is_bt)
    } else {
        Err("No controller connected".into())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = Arc::new(AppState {
        status: Mutex::new(Ds4Status::disconnected()),
        device: Mutex::new(None),
        device_info: Mutex::new(None),
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app_state.clone())
        .invoke_handler(tauri::generate_handler![get_ds4_status, set_lightbar])
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
                let api = match HidApi::new() {
                    Ok(api) => api,
                    Err(_) => return,
                };

                loop {
                    // Scope for Mutex guards to ensure they are dropped before sleeping
                    let status = {
                        let mut device_lock = state.device.lock().unwrap();
                        let mut info_lock = state.device_info.lock().unwrap();
                        let mut status_lock = state.status.lock().unwrap();

                        // If not connected, try to find and open a device
                        if device_lock.is_none() {
                            if let Some(info) = ds4_hid::find_ds4(&api) {
                                if let Ok(device) = info.open_device(&api) {
                                    *info_lock = Some(info);
                                    *device_lock = Some(device);
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

