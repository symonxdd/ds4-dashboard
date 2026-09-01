use std::collections::{HashMap, HashSet};
use std::sync::atomic::AtomicBool;
use std::sync::mpsc::Sender;
use std::sync::Mutex;

use ds4_hid::{Connection, DeviceId, Ds4Report, OutputState};
use serde::Serialize;

/// A controller that is open and has reported at least once.
pub struct Controller {
    pub connection: Connection,
    pub vendor_id: u16,
    pub product_id: u16,
    pub is_v2: bool,
    pub report: Ds4Report,
    /// Queue of lightbar/rumble writes for this pad's reader thread, which owns
    /// the HID handle and is the only thread allowed to touch it.
    pub outputs: Sender<OutputState>,
}

/// Shared application state
pub struct AppState {
    pub controllers: Mutex<HashMap<DeviceId, Controller>>,
    /// HID paths a reader thread currently owns, so the device scan does not
    /// open the same controller twice.
    pub claimed_paths: Mutex<HashSet<String>>,
    /// The controller the lightbar panel, tray icon and input emulation follow.
    pub selected: Mutex<Option<DeviceId>>,
    /// Last output written per controller, re-applied when that pad reconnects.
    pub saved_outputs: Mutex<HashMap<DeviceId, OutputState>>,
    pub tray_visible: Mutex<bool>,
    pub close_to_tray: Mutex<bool>,
    pub mouse_emulation: AtomicBool,
    pub stick_emulation: AtomicBool,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            controllers: Mutex::new(HashMap::new()),
            claimed_paths: Mutex::new(HashSet::new()),
            selected: Mutex::new(None),
            saved_outputs: Mutex::new(HashMap::new()),
            tray_visible: Mutex::new(true),
            close_to_tray: Mutex::new(false),
            mouse_emulation: AtomicBool::new(false),
            stick_emulation: AtomicBool::new(false),
        }
    }
}

/// One controller as the frontend and the tray icon see it.
#[derive(Debug, Clone, Serialize)]
pub struct ControllerView {
    pub id: DeviceId,
    pub label: String,
    pub connection: Connection,
    pub battery: u8,
    pub charging: bool,
    pub vendor_id: u16,
    pub product_id: u16,
    pub is_v2: bool,
    pub selected: bool,
}
