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
use enigo::{Enigo, Mouse, Settings, Coordinate, Button, Direction};

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
    mouse_emulation: Mutex<bool>,
    stick_emulation: Mutex<bool>,
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

/// Tauri command — toggles touchpad mouse emulation.
#[tauri::command]
fn toggle_mouse_emulation(state: State<'_, Arc<AppState>>, enabled: bool) {
    let mut mouse_emulation = state.mouse_emulation.lock().unwrap();
    *mouse_emulation = enabled;
}

/// Tauri command — toggles stick mouse emulation.
#[tauri::command]
fn toggle_stick_emulation(state: State<'_, Arc<AppState>>, enabled: bool) {
    let mut stick_emulation = state.stick_emulation.lock().unwrap();
    *stick_emulation = enabled;
}

use include_dir::{include_dir, Dir};

static ALT_ICONS: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/../public/alt-icons");
static BASE_ICONS: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/icons");

#[tauri::command]
fn set_app_icon(app_handle: tauri::AppHandle, id: String) -> Result<(), String> {
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
            .ok_or(format!("Icon file '{}' not found in embedded storage", filename))?
    };

    let icon = decode_ico_to_image(bytes)?;
    window.set_icon(icon).map_err(|e| e.to_string())?;
    Ok(())
}

fn decode_ico_to_image(bytes: &[u8]) -> Result<tauri::image::Image<'static>, String> {
    let img = image::load_from_memory_with_format(bytes, image::ImageFormat::Ico)
        .map_err(|e| format!("Icon decode error: {}", e))?;
    
    let scaled = img.resize(32, 32, image::imageops::FilterType::Lanczos3);
    let rgba = scaled.to_rgba8();
    let (width, height) = rgba.dimensions();
    
    Ok(tauri::image::Image::new_owned(rgba.into_raw(), width, height))
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
        mouse_emulation: Mutex::new(false),
        stick_emulation: Mutex::new(false),
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
            toggle_close_to_tray,
            toggle_mouse_emulation,
            toggle_stick_emulation,
            set_app_icon
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
            // Check for --minimized flag
            let args: Vec<String> = std::env::args().collect();
            if args.contains(&"--minimized".to_string()) {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            }

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
                let mut enigo = Enigo::new(&Settings::default()).expect("Failed to init enigo");
                let mut last_touch_x: Option<i32> = None;
                let mut last_touch_y: Option<i32> = None;
                let mut last_touchpad_btn = false;
                
                let mut slow_tick_counter = 0;

                loop {
                    let status = {
                        let mut device_lock = state.device.lock().unwrap();
                        let mut info_lock = state.device_info.lock().unwrap();
                        let mut status_lock = state.status.lock().unwrap();

                        // If not connected, try to find and open a device
                        if device_lock.is_none() {
                            if let Ok(api) = HidApi::new() {
                                if let Some(info) = ds4_hid::find_ds4(&api) {
                                    if let Ok(device) = info.open_device(&api) {
                                        let is_bt = matches!(info.bus_type(), hidapi::BusType::Bluetooth);
                                        
                                        if is_bt {
                                            let _ = ds4_hid::send_bt_handshake(&device);
                                        }

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

                    // ── Mouse Emulation ──
                    if status.connected {
                        let mouse_enabled = *state.mouse_emulation.lock().unwrap();
                        let stick_enabled = *state.stick_emulation.lock().unwrap();

                        if mouse_enabled {
                            // Touchpad movement
                            if status.touchpad_active {
                                let curr_x = status.touchpad_x as i32;
                                let curr_y = status.touchpad_y as i32;

                                if let (Some(lx), Some(ly)) = (last_touch_x, last_touch_y) {
                                    let dx = curr_x - lx;
                                    let dy = curr_y - ly;

                                    // Filter out jumps (new touch or data glitch)
                                    if dx.abs() < 200 && dy.abs() < 200 {
                                        // Scaling factor for touchpad
                                        let _ = enigo.move_mouse(dx, dy, Coordinate::Rel);
                                    }
                                }
                                last_touch_x = Some(curr_x);
                                last_touch_y = Some(curr_y);
                            } else {
                                last_touch_x = None;
                                last_touch_y = None;
                            }

                            // Touchpad click
                            if status.touchpad_button != last_touchpad_btn {
                                if status.touchpad_button {
                                    let _ = enigo.button(Button::Left, Direction::Press);
                                } else {
                                    let _ = enigo.button(Button::Left, Direction::Release);
                                }
                                last_touchpad_btn = status.touchpad_button;
                            }
                        }

                        if stick_enabled {
                            // Right stick movement
                            let sx = status.right_stick_x as i32 - 128;
                            let sy = status.right_stick_y as i32 - 128;
                            
                            let deadzone = 15;
                            if sx.abs() > deadzone || sy.abs() > deadzone {
                                // Scale movement based on stick deflection
                                // Max deflection is ~127. 127/10 = ~12 pixels per tick.
                                let dx = sx / 10;
                                let dy = sy / 10;
                                let _ = enigo.move_mouse(dx, dy, Coordinate::Rel);
                            }
                        }
                    }

                    // ── Slow Path (1 second) ──
                    slow_tick_counter += 1;
                    if slow_tick_counter >= 100 { // Assuming 10ms loop
                        slow_tick_counter = 0;

                        // Update Tray
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
                    }

                    thread::sleep(Duration::from_millis(10));
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
