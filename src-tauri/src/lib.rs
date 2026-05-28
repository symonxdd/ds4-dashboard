mod tray_icon;
mod state;
mod commands;
mod icon_utils;
mod polling;

use std::sync::Arc;
use tauri::Manager;

pub fn run() {
    // Set AppUserModelID to override Windows taskbar grouping.
    // A custom ID prevents Windows Shell from forcing the Start Menu
    // shortcut's static icon on the running process's taskbar button.
    let hr = icon_utils::set_explicit_app_user_model_id("com.symon.ds4-dashboard.temp-aumid");
    println!("[AUMID Setup] SetCurrentProcessExplicitAppUserModelID returned: 0x{:X}", hr);

    let app_state = Arc::new(state::AppState {
        status: std::sync::Mutex::new(ds4_hid::Ds4Status::disconnected()),
        device: std::sync::Mutex::new(None),
        device_info: std::sync::Mutex::new(None),
        tray_visible: std::sync::Mutex::new(true),
        close_to_tray: std::sync::Mutex::new(false),
        last_state: std::sync::Mutex::new(None),
        mouse_emulation: std::sync::Mutex::new(false),
        stick_emulation: std::sync::Mutex::new(false),
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .manage(app_state.clone())
        .invoke_handler(tauri::generate_handler![
            commands::get_ds4_status,
            commands::set_output_state,
            commands::toggle_tray_icon,
            commands::toggle_close_to_tray,
            commands::toggle_mouse_emulation,
            commands::toggle_stick_emulation,
            commands::set_app_icon
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let state = window.state::<Arc<state::AppState>>();
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

            // Setup system tray menu and build tray icon
            let show = tauri::menu::MenuItem::with_id(app, "show", "Show Dashboard", true, None::<&str>)?;
            let quit = tauri::menu::MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = tauri::menu::MenuBuilder::new(app)
                .item(&show)
                .separator()
                .item(&quit)
                .build()?;

            let _tray = tauri::tray::TrayIconBuilder::with_id("ds4-tray")
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
                    if let tauri::tray::TrayIconEvent::Click {
                        button: tauri::tray::MouseButton::Left,
                        button_state: tauri::tray::MouseButtonState::Up,
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

            polling::spawn_polling_thread(app.handle().clone(), app_state.clone());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
