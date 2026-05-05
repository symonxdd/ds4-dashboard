//! # ds4-hid
//!
//! A minimal library to read DualShock 4 controller status through HID.
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

use crc::{Crc, CRC_32_ISO_HDLC};
use hidapi::{BusType, HidApi};
use serde::Serialize;

const DS4_IDS: &[(u16, u16)] = &[
    (0x054C, 0x05C4),
    (0x054C, 0x09CC),
    (0x054C, 0x0BA0),
    (0x054C, 0x05C5),
];

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub enum Connection {
    Usb,
    Bluetooth,
}

#[derive(Debug, Clone, Serialize)]
pub struct Ds4Status {
    pub connected: bool,
    pub connection: Option<Connection>,
    pub battery: u8,
    pub charging: bool,
    pub vendor_id: Option<u16>,
    pub product_id: Option<u16>,
    pub is_v2: Option<bool>,
    // Sticks (0-255, center is ~128)
    pub left_stick_x: u8,
    pub left_stick_y: u8,
    pub right_stick_x: u8,
    pub right_stick_y: u8,
    // Touchpad (Touch 1)
    pub touchpad_active: bool,
    pub touchpad_x: u16,
    pub touchpad_y: u16,
    pub touchpad_button: bool,
}

impl Ds4Status {
    pub fn disconnected() -> Self {
        Self {
            connected: false,
            connection: None,
            battery: 0,
            charging: false,
            vendor_id: None,
            product_id: None,
            is_v2: None,
            left_stick_x: 128,
            left_stick_y: 128,
            right_stick_x: 128,
            right_stick_y: 128,
            touchpad_active: false,
            touchpad_x: 0,
            touchpad_y: 0,
            touchpad_button: false,
        }
    }
}

pub fn find_ds4(api: &HidApi) -> Option<hidapi::DeviceInfo> {
    api.device_list()
        .find(|d| {
            DS4_IDS
                .iter()
                .any(|&(vid, pid)| d.vendor_id() == vid && d.product_id() == pid)
        })
        .cloned()
}

pub fn poll() -> Ds4Status {
    let api = match HidApi::new() {
        Ok(api) => api,
        Err(_) => return Ds4Status::disconnected(),
    };

    let info = match find_ds4(&api) {
        Some(info) => info,
        None => return Ds4Status::disconnected(),
    };

    let device = match info.open_device(&api) {
        Ok(d) => d,
        Err(_) => return Ds4Status::disconnected(),
    };

    read_status(&device, &info)
}

pub fn read_status(device: &hidapi::HidDevice, info: &hidapi::DeviceInfo) -> Ds4Status {
    let is_bt = matches!(info.bus_type(), BusType::Bluetooth);

    let mut buf = [0u8; 256];
    for _ in 0..10 {
        let n = match device.read_timeout(&mut buf, 100) {
            Ok(n) => n,
            Err(_) => continue,
        };
        if n == 0 {
            continue;
        }

        let report_id = buf[0];
        let data_start = match (report_id, is_bt) {
            (0x01, false) => 1usize,
            (0x11, true) => 3usize,
            _ => continue,
        };

        if buf.len() < data_start + 30 {
            continue;
        }

        let bat_byte = buf[data_start + 29];
        let charging = bat_byte & 0x10 != 0;
        let raw_level = bat_byte & 0x0F;

        let battery = if charging {
            ((raw_level as u16) * 100 / 11).min(100) as u8
        } else {
            ((raw_level as u16) * 100 / 8).min(100) as u8
        };

        // Sticks
        let left_stick_x = buf[data_start + 0];
        let left_stick_y = buf[data_start + 1];
        let right_stick_x = buf[data_start + 2];
        let right_stick_y = buf[data_start + 3];

        // Buttons (Touchpad button is bit 1 of byte 6)
        let touchpad_button = (buf[data_start + 6] & 0x02) != 0;

        // Touchpad (Touch 1)
        // Bit 7 is 0 when active
        let touchpad_active = (buf[data_start + 33] & 0x80) == 0;
        let touchpad_x = (buf[data_start + 34] as u16) | (((buf[data_start + 35] & 0x0F) as u16) << 8);
        let touchpad_y = (((buf[data_start + 35] & 0xF0) as u16) >> 4) | ((buf[data_start + 36] as u16) << 4);

        return Ds4Status {
            connected: true,
            connection: Some(if is_bt {
                Connection::Bluetooth
            } else {
                Connection::Usb
            }),
            battery,
            charging,
            vendor_id: Some(info.vendor_id()),
            product_id: Some(info.product_id()),
            is_v2: Some(info.product_id() == 0x09CC),
            left_stick_x,
            left_stick_y,
            right_stick_x,
            right_stick_y,
            touchpad_active,
            touchpad_x,
            touchpad_y,
            touchpad_button,
        };
    }

    Ds4Status::disconnected()
}

pub fn send_bt_handshake(device: &hidapi::HidDevice) -> Result<(), String> {
    let mut feat = [0u8; 64];
    feat[0] = 0x02;
    device
        .get_feature_report(&mut feat)
        .map(|_| ())
        .map_err(|e| e.to_string())
}

pub fn set_output_state(
    device: &hidapi::HidDevice,
    r: u8,
    g: u8,
    b: u8,
    small_rumble: u8,
    large_rumble: u8,
    is_bt: bool,
) -> Result<(), String> {
    if is_bt {
        let mut report = [0u8; 78];
        report[0] = 0x11;
        report[1] = 0x80;
        report[3] = 0xFF; // Enable Rumble (0x01) and Lightbar (0x02) and others

        report[6] = small_rumble;
        report[7] = large_rumble;
        report[8] = r;
        report[9] = g;
        report[10] = b;

        let mut crc_buf = [0u8; 75];
        crc_buf[0] = 0xA2;
        crc_buf[1..75].copy_from_slice(&report[0..74]);

        let crc = Crc::<u32>::new(&CRC_32_ISO_HDLC);
        let checksum = crc.checksum(&crc_buf);

        report[74] = (checksum & 0xFF) as u8;
        report[75] = ((checksum >> 8) & 0xFF) as u8;
        report[76] = ((checksum >> 16) & 0xFF) as u8;
        report[77] = ((checksum >> 24) & 0xFF) as u8;

        device
            .write(&report)
            .map_err(|e: hidapi::HidError| e.to_string())?;
    } else {
        let mut report = [0u8; 32];
        report[0] = 0x05;
        report[1] = 0xFF; // Enable Rumble, Lightbar, and Flash

        report[4] = small_rumble;
        report[5] = large_rumble;
        report[6] = r;
        report[7] = g;
        report[8] = b;

        device
            .write(&report)
            .map_err(|e: hidapi::HidError| e.to_string())?;
    }
    Ok(())
}
