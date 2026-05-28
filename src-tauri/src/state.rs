use std::sync::Mutex;
use ds4_hid::Ds4Status;

#[derive(Clone, Copy)]
pub struct LightbarState {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub small_rumble: u8,
    pub large_rumble: u8,
}

/// Shared application state
pub struct AppState {
    pub status: Mutex<Ds4Status>,
    pub device: Mutex<Option<hidapi::HidDevice>>,
    pub device_info: Mutex<Option<hidapi::DeviceInfo>>,
    pub tray_visible: Mutex<bool>,
    pub close_to_tray: Mutex<bool>,
    pub last_state: Mutex<Option<LightbarState>>,
    pub mouse_emulation: Mutex<bool>,
    pub stick_emulation: Mutex<bool>,
}
