use std::sync::Arc;
use std::thread;
use std::time::Duration;
use tauri::Emitter;
use hidapi::HidApi;
use enigo::{Enigo, Mouse, Settings, Coordinate, Button, Direction};
use ds4_hid::{Connection, Ds4Status};
use crate::state::AppState;
use crate::tray_icon;

/// Spawns the background hardware polling thread.
/// It reads controller reports, updates shared state, performs input emulation, and handles tray icon changes.
pub fn spawn_polling_thread(app_handle: tauri::AppHandle, state: Arc<AppState>) {
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
}
