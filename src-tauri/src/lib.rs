use ds4_hid::Ds4Status;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::{
    menu::{MenuBuilder, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};

/// Shared DS4 state, updated by the background polling thread.
type SharedStatus = Arc<Mutex<Ds4Status>>;

/// Tauri command — returns the latest DS4 status to the frontend.
#[tauri::command]
fn get_ds4_status(state: tauri::State<'_, SharedStatus>) -> Ds4Status {
    state.lock().unwrap().clone()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let ds4_state: SharedStatus = Arc::new(Mutex::new(Ds4Status::disconnected()));
    let ds4_state_bg = ds4_state.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(ds4_state)
        .invoke_handler(tauri::generate_handler![get_ds4_status])
        .setup(|app| {
            // ── System Tray ──────────────────────────────────────
            let show = MenuItem::with_id(app, "show", "Show Dashboard", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = MenuBuilder::new(app).item(&show).separator().item(&quit).build()?;

            let _tray = TrayIconBuilder::with_id("ds4-tray")
                .tooltip("DS4 Dashboard — Scanning...")
                .menu(&menu)
                .on_menu_event(|app, event| {
                    match event.id().as_ref() {
                        "show" => {
                            if let Some(w) = app.get_webview_window("main") {
                                let _ = w.show();
                                let _ = w.set_focus();
                            }
                        }
                        "quit" => app.exit(0),
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    // Left-click on tray icon → show the dashboard window.
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
            thread::spawn(move || {
                loop {
                    let status = ds4_hid::poll();
                    *ds4_state_bg.lock().unwrap() = status.clone();

                    // Update tray tooltip with current battery info.
                    if let Some(tray) = app_handle.tray_by_id("ds4-tray") {
                        let tooltip = if status.connected {
                            let conn = match status.connection {
                                Some(ds4_hid::Connection::Bluetooth) => "BT",
                                Some(ds4_hid::Connection::Usb) => "USB",
                                None => "?",
                            };
                            let charge = if status.charging { " ⚡" } else { "" };
                            format!("DS4: {}% · {}{}", status.battery, conn, charge)
                        } else {
                            "DS4: No controller".into()
                        };
                        let _ = tray.set_tooltip(Some(&tooltip));
                    }

                    // Emit event so the frontend can update in real time.
                    let _ = app_handle.emit("ds4-status-update", &status);

                    thread::sleep(Duration::from_secs(2));
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
