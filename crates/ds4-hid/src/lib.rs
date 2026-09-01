//! # ds4-hid
//!
//! A minimal library for talking to DualShock 4 controllers over HID.
//!
//! Any number of controllers can be open at once. Each [`Ds4Device`] owns one
//! controller's HID handle and carries a [`DeviceId`] derived from the pad's
//! Bluetooth MAC, so the same physical controller keeps its identity across
//! reconnects and across USB/Bluetooth.
//!
//! Supports reading battery level, charging state, sticks and touchpad, and
//! writing lightbar color and rumble.
//!
//! # Example
//!
//! ```no_run
//! let api = hidapi::HidApi::new().unwrap();
//!
//! for info in ds4_hid::find_all_ds4(&api) {
//!     let device = ds4_hid::Ds4Device::open(&api, &info).unwrap();
//!     println!("{} on {:?}", device.id(), device.connection());
//!
//!     if let Ok(Some(report)) = device.read() {
//!         println!("Battery: {}%, charging: {}", report.battery, report.charging);
//!     }
//! }
//! ```

use std::fmt;

use crc::{Crc, CRC_32_ISO_HDLC};
use hidapi::{BusType, DeviceInfo, HidApi, HidDevice, HidError};
use serde::{Deserialize, Serialize};

const DS4_IDS: &[(u16, u16)] = &[
    (0x054C, 0x05C4),
    (0x054C, 0x09CC),
    (0x054C, 0x0BA0),
    (0x054C, 0x05C5),
];

/// Product ID of the DualShock 4 v2 (CUH-ZCT2).
const PRODUCT_ID_V2: u16 = 0x09CC;

/// Kept short so a queued lightbar or rumble write is never stuck behind a read.
/// A connected controller streams reports far faster than this, so the timeout
/// only elapses when a pad has genuinely gone quiet.
const READ_TIMEOUT_MS: i32 = 10;

/// The smallest payload every field parsed below fits in.
const MIN_PAYLOAD_LEN: usize = 37;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub enum Connection {
    Usb,
    Bluetooth,
}

/// One decoded input report.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct Ds4Report {
    pub battery: u8,
    pub charging: bool,
    /// Sticks are 0-255, centered at ~128.
    pub left_stick_x: u8,
    pub left_stick_y: u8,
    pub right_stick_x: u8,
    pub right_stick_y: u8,
    pub touchpad_active: bool,
    pub touchpad_x: u16,
    pub touchpad_y: u16,
    pub touchpad_button: bool,
}

/// Lightbar color and rumble, as written back to the controller.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
pub struct OutputState {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub small_rumble: u8,
    pub large_rumble: u8,
}

/// A controller's stable identity: its Bluetooth MAC where one can be read,
/// otherwise its HID device path.
///
/// The MAC is what makes a pad recognizable after it reconnects, or after it
/// moves between USB and Bluetooth. The path fallback is unique per connected
/// device but does not survive a replug.
#[derive(Debug, Clone, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
pub struct DeviceId(String);

impl DeviceId {
    fn from_mac(mac: [u8; 6]) -> Self {
        let hex: Vec<String> = mac.iter().map(|b| format!("{b:02x}")).collect();
        Self(hex.join(":"))
    }

    fn from_path(info: &DeviceInfo) -> Self {
        Self(format!("path:{}", info.path().to_string_lossy()))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for DeviceId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

/// An open connection to a single controller.
pub struct Ds4Device {
    handle: HidDevice,
    id: DeviceId,
    connection: Connection,
    vendor_id: u16,
    product_id: u16,
}

impl Ds4Device {
    pub fn open(api: &HidApi, info: &DeviceInfo) -> Result<Self, HidError> {
        let handle = info.open_device(api)?;
        let connection = match info.bus_type() {
            BusType::Bluetooth => Connection::Bluetooth,
            _ => Connection::Usb,
        };

        // Over Bluetooth a DS4 boots into a "basic mode" that reports no battery
        // data at all. This switches it into full mode; see docs/bugs-and-quirks.md.
        if connection == Connection::Bluetooth {
            let _ = request_full_mode(&handle);
        }

        let id = mac_from_serial(info)
            .or_else(|| mac_from_feature_report(&handle))
            .map(DeviceId::from_mac)
            .unwrap_or_else(|| DeviceId::from_path(info));

        Ok(Self {
            handle,
            id,
            connection,
            vendor_id: info.vendor_id(),
            product_id: info.product_id(),
        })
    }

    pub fn id(&self) -> &DeviceId {
        &self.id
    }

    pub fn connection(&self) -> Connection {
        self.connection
    }

    pub fn vendor_id(&self) -> u16 {
        self.vendor_id
    }

    pub fn product_id(&self) -> u16 {
        self.product_id
    }

    pub fn is_v2(&self) -> bool {
        self.product_id == PRODUCT_ID_V2
    }

    /// Reads the next input report.
    ///
    /// `Ok(None)` means nothing arrived in time, or the controller sent a report
    /// this library does not decode; both are normal. `Err` means the device is
    /// gone.
    pub fn read(&self) -> Result<Option<Ds4Report>, HidError> {
        let mut buf = [0u8; 256];
        let len = self.handle.read_timeout(&mut buf, READ_TIMEOUT_MS)?;
        Ok(parse_report(&buf[..len], self.connection))
    }

    /// Writes lightbar color and rumble. The report layout differs per transport:
    /// 32 bytes on USB, and 78 bytes over Bluetooth with a trailing CRC-32 the
    /// controller silently rejects the report without.
    pub fn set_output(&self, state: OutputState) -> Result<(), HidError> {
        match self.connection {
            Connection::Bluetooth => {
                let mut report = [0u8; 78];
                report[0] = 0x11;
                report[1] = 0x80;
                report[3] = 0xFF;
                report[6] = state.small_rumble;
                report[7] = state.large_rumble;
                report[8] = state.r;
                report[9] = state.g;
                report[10] = state.b;

                let mut crc_buf = [0u8; 75];
                crc_buf[0] = 0xA2;
                crc_buf[1..75].copy_from_slice(&report[0..74]);
                let checksum = Crc::<u32>::new(&CRC_32_ISO_HDLC).checksum(&crc_buf);
                report[74..78].copy_from_slice(&checksum.to_le_bytes());

                self.handle.write(&report)?;
            }
            Connection::Usb => {
                let mut report = [0u8; 32];
                report[0] = 0x05;
                report[1] = 0xFF;
                report[4] = state.small_rumble;
                report[5] = state.large_rumble;
                report[6] = state.r;
                report[7] = state.g;
                report[8] = state.b;

                self.handle.write(&report)?;
            }
        }
        Ok(())
    }
}

/// Returns every DS4 currently enumerated by the OS.
pub fn find_all_ds4(api: &HidApi) -> Vec<DeviceInfo> {
    api.device_list()
        .filter(|d| {
            DS4_IDS
                .iter()
                .any(|&(vid, pid)| d.vendor_id() == vid && d.product_id() == pid)
        })
        .cloned()
        .collect()
}

fn parse_report(buf: &[u8], connection: Connection) -> Option<Ds4Report> {
    let payload = match (buf.first().copied()?, connection) {
        (0x01, Connection::Usb) => buf.get(1..)?,
        (0x11, Connection::Bluetooth) => buf.get(3..)?,
        _ => return None,
    };

    if payload.len() < MIN_PAYLOAD_LEN {
        return None;
    }

    // Byte 29 packs both charge state and level: bit 0x10 is the charging flag,
    // and the low nibble is a raw level counting to 11 while charging but only
    // to 8 on battery.
    let battery_byte = payload[29];
    let charging = battery_byte & 0x10 != 0;
    let raw_level = u16::from(battery_byte & 0x0F);
    let full_scale = if charging { 11 } else { 8 };
    let battery = (raw_level * 100 / full_scale).min(100) as u8;

    Some(Ds4Report {
        battery,
        charging,
        left_stick_x: payload[0],
        left_stick_y: payload[1],
        right_stick_x: payload[2],
        right_stick_y: payload[3],
        touchpad_button: payload[6] & 0x02 != 0,
        // Bit 7 of byte 33 is *clear* while a finger is down.
        touchpad_active: payload[33] & 0x80 == 0,
        touchpad_x: u16::from(payload[34]) | (u16::from(payload[35] & 0x0F) << 8),
        touchpad_y: u16::from(payload[35] & 0xF0) >> 4 | (u16::from(payload[36]) << 4),
    })
}

fn request_full_mode(handle: &HidDevice) -> Result<(), HidError> {
    let mut report = [0u8; 64];
    report[0] = 0x02;
    handle.get_feature_report(&mut report)?;
    Ok(())
}

/// On Bluetooth, Windows reports the pad's MAC as the HID serial number.
fn mac_from_serial(info: &DeviceInfo) -> Option<[u8; 6]> {
    let digits: Vec<u8> = info
        .serial_number()?
        .bytes()
        .filter(u8::is_ascii_hexdigit)
        .collect();

    let pairs: &[u8; 12] = digits.as_slice().try_into().ok()?;
    let mut mac = [0u8; 6];
    for (byte, pair) in mac.iter_mut().zip(pairs.chunks_exact(2)) {
        let text = std::str::from_utf8(pair).ok()?;
        *byte = u8::from_str_radix(text, 16).ok()?;
    }
    Some(mac)
}

/// Over USB a DS4 exposes no serial number string, so its MAC has to be asked
/// for directly. Feature report 0x12 returns it in bytes 1..7, least
/// significant byte first.
fn mac_from_feature_report(handle: &HidDevice) -> Option<[u8; 6]> {
    let mut report = [0u8; 16];
    report[0] = 0x12;
    if handle.get_feature_report(&mut report).ok()? < 7 {
        return None;
    }

    let mut mac = [0u8; 6];
    for (i, byte) in mac.iter_mut().enumerate() {
        *byte = report[6 - i];
    }
    Some(mac)
}
