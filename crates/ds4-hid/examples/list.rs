//! Lists every connected DualShock 4 with its identity and current battery.
//!
//! ```text
//! cargo run --example list
//! ```

use hidapi::HidApi;

fn main() {
    let api = HidApi::new().expect("could not initialize hidapi");
    let devices = ds4_hid::find_all_ds4(&api);

    if devices.is_empty() {
        println!("No DualShock 4 found.");
        return;
    }

    for info in devices {
        match ds4_hid::Ds4Device::open(&api, &info) {
            Ok(device) => {
                let model = if device.is_v2() { "v2" } else { "v1" };
                print!("DS4 {model} {} on {:?}: ", device.id(), device.connection());

                // A controller can send reports this library skips, so give it a
                // few attempts before concluding it has nothing to say.
                let report = (0..100).find_map(|_| device.read().ok().flatten());

                match report {
                    Some(report) => println!(
                        "{}%{}",
                        report.battery,
                        if report.charging { ", charging" } else { "" }
                    ),
                    None => println!("no readable report"),
                }
            }
            Err(err) => println!("{:?}: could not open: {err}", info.path()),
        }
    }
}
