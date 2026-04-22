//! # ds4-hid
//!
//! A minimal library to read DualShock 4 controller status via HID.
//!
//! Currently supports reading:
//! - **Connection type** (USB or Bluetooth)
//! - **Battery level** (0–100%)
//! - **Charging state**
//!
//! # Example
//!
//! ```no_run
//! let status = ds4_hid::poll();
//!
//! if status.connected {
//!     println!("Battery: {}%", status.battery);
//!     println!("Connection: {:?}", status.connection);
//!     println!("Charging: {}", status.charging);
//! } else {
//!     println!("No DS4 controller found.");
//! }
//! ```

use hidapi::{BusType, HidApi};
use serde::Serialize;

/// Known DualShock 4 vendor/product ID pairs.
const DS4_IDS: &[(u16, u16)] = &[
    (0x054C, 0x05C4), // DS4 v1
    (0x054C, 0x09CC), // DS4 v2
    (0x054C, 0x0BA0), // DS4 wireless adapter
    (0x054C, 0x05C5), // DS4 v1 (alternate)
];

/// How the controller is connected.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub enum Connection {
    Usb,
    Bluetooth,
}

/// Current status of a DualShock 4 controller.
#[derive(Debug, Clone, Serialize)]
pub struct Ds4Status {
    /// Whether a controller was found and successfully read.
    pub connected: bool,
    /// Connection type (USB or Bluetooth). Only meaningful when `connected` is true.
    pub connection: Option<Connection>,
    /// Battery level as a percentage (0–100). Only meaningful when `connected` is true.
    pub battery: u8,
    /// Whether the battery is currently charging. Only meaningful when `connected` is true.
    pub charging: bool,
}

impl Ds4Status {
    /// Returns a disconnected status.
    pub fn disconnected() -> Self {
        Self {
            connected: false,
            connection: None,
            battery: 0,
            charging: false,
        }
    }
}

/// Polls for a connected DualShock 4 and reads its current status.
///
/// This function:
/// 1. Scans all HID devices for known DS4 vendor/product IDs
/// 2. Detects the connection type (USB vs Bluetooth) via the HID bus type
/// 3. Over Bluetooth, requests feature report `0x02` to activate full report mode
/// 4. Reads one input report and extracts battery level + charging state
///
/// Returns [`Ds4Status`] with `connected: false` if no controller is found.
pub fn poll() -> Ds4Status {
    let api = match HidApi::new() {
        Ok(api) => api,
        Err(_) => return Ds4Status::disconnected(),
    };

    // Find the first connected DS4.
    let info = match api.device_list().find(|d| {
        DS4_IDS
            .iter()
            .any(|&(vid, pid)| d.vendor_id() == vid && d.product_id() == pid)
    }) {
        Some(info) => info,
        None => return Ds4Status::disconnected(),
    };

    let is_bt = matches!(info.bus_type(), BusType::Bluetooth);
    let connection = if is_bt {
        Connection::Bluetooth
    } else {
        Connection::Usb
    };

    // Open the device.
    let device = match info.open_device(&api) {
        Ok(d) => d,
        Err(_) => return Ds4Status::disconnected(),
    };

    // Over Bluetooth, the DS4 starts in "basic mode" — it sends small 0x01
    // reports with only stick/button data. Reading feature report 0x02
    // switches the controller to "full mode" (report 0x11) which includes
    // battery, IMU, and touchpad data.
    if is_bt {
        let mut feat = [0u8; 64];
        feat[0] = 0x02;
        let _ = device.get_feature_report(&mut feat);
    }

    // Try to read a valid report (up to 10 attempts).
    let mut buf = [0u8; 256];
    for _ in 0..10 {
        let n = match device.read_timeout(&mut buf, 500) {
            Ok(n) => n,
            Err(_) => continue,
        };
        if n == 0 {
            continue;
        }

        let report_id = buf[0];

        // Determine where the input data starts:
        //   Report 0x01 (USB):     data at position 1
        //   Report 0x11 (BT full): data at position 3 (2 header bytes)
        let data_start = match (report_id, is_bt) {
            (0x01, false) => 1usize,
            (0x11, true) => 3usize,
            _ => continue, // Skip unexpected reports
        };

        // Battery info is at offset 29 from the input data start.
        // Bit 4 (0x10) = charging flag.
        // Lower nibble (0x0F) = raw battery level.
        let bat_byte = buf[data_start + 29];
        let charging = bat_byte & 0x10 != 0;
        let raw_level = bat_byte & 0x0F;

        // Scale to 0–100%. The DS4 uses different divisors depending on
        // whether it's charging (max raw = 11) or not (max raw = 8).
        let battery = if charging {
            ((raw_level as u16) * 100 / 11).min(100) as u8
        } else {
            ((raw_level as u16) * 100 / 8).min(100) as u8
        };

        return Ds4Status {
            connected: true,
            connection: Some(connection),
            battery,
            charging,
        };
    }

    // Controller found but couldn't read battery data.
    Ds4Status {
        connected: true,
        connection: Some(connection),
        battery: 0,
        charging: false,
    }
}
