use std::collections::{HashMap, HashSet};
use std::sync::atomic::Ordering;
use std::sync::mpsc::{self, Receiver, Sender};
use std::sync::Arc;
use std::thread;
use std::time::Duration;

use ds4_hid::{DeviceId, Ds4Device, Ds4Report, OutputState};
use hidapi::HidApi;
use tauri::{AppHandle, Emitter};

use crate::emulation::{self, InputEvent};
use crate::state::{AppState, Controller, ControllerView};
use crate::tray_icon;

pub const CONTROLLERS_EVENT: &str = "ds4-controllers-update";

/// hidapi has no hotplug notification on Windows, so a controller being plugged
/// in or switched on can only be noticed by re-enumerating. Everything past
/// discovery is driven by the controllers themselves rather than by a clock.
const SCAN_INTERVAL: Duration = Duration::from_millis(500);

pub fn spawn(app: AppHandle, state: Arc<AppState>) {
    let emulation = emulation::spawn(state.clone());
    thread::spawn(move || scan_for_controllers(app, state, emulation));
}

fn scan_for_controllers(app: AppHandle, state: Arc<AppState>, emulation: Sender<InputEvent>) {
    // Replaces the tray's placeholder tooltip, which would otherwise sit there
    // reading "Scanning..." for as long as no controller ever connects.
    publish(&app, &state);

    let mut api = match HidApi::new() {
        Ok(api) => api,
        Err(err) => {
            eprintln!("[hid] could not initialize hidapi: {err}");
            return;
        }
    };

    loop {
        match api.refresh_devices() {
            Err(err) => eprintln!("[hid] device scan failed: {err}"),
            Ok(()) => {
                let devices = ds4_hid::find_all_ds4(&api);
                let present: HashSet<String> = devices
                    .iter()
                    .map(|info| info.path().to_string_lossy().into_owned())
                    .collect();

                // Claims are released here rather than by the reader threads, so
                // that a device this app has decided not to read from is not
                // re-opened on every single scan.
                state
                    .claimed_paths
                    .lock()
                    .unwrap()
                    .retain(|path| present.contains(path));

                for info in devices {
                    let path = info.path().to_string_lossy().into_owned();
                    if !state.claimed_paths.lock().unwrap().insert(path.clone()) {
                        continue;
                    }

                    match Ds4Device::open(&api, &info) {
                        Ok(device) => {
                            let app = app.clone();
                            let state = state.clone();
                            let emulation = emulation.clone();
                            thread::spawn(move || run(device, &app, &state, &emulation));
                        }
                        Err(err) => eprintln!("[hid] could not open {path}: {err}"),
                    }
                }
            }
        }

        thread::sleep(SCAN_INTERVAL);
    }
}

/// Owns one controller's HID handle for as long as it stays connected: applies
/// queued lightbar and rumble writes, reads its reports, and keeps shared state,
/// the tray icon and the frontend in step with them.
///
/// The controller only becomes visible to the rest of the app once it has
/// reported for the first time, so a pad never appears with a placeholder
/// battery level.
fn run(device: Ds4Device, app: &AppHandle, state: &AppState, emulation: &Sender<InputEvent>) {
    let id = device.id().clone();
    let (sender, queued_outputs) = mpsc::channel();

    if let Some(output) = state.saved_outputs.lock().unwrap().get(&id).copied() {
        let _ = device.set_output(output);
    }

    let mut registered = false;
    loop {
        if let Some(output) = latest(&queued_outputs) {
            if let Err(err) = device.set_output(output) {
                eprintln!("[hid] write to {id} failed: {err}");
                break;
            }
        }

        let report = match device.read() {
            Ok(Some(report)) => report,
            Ok(None) => continue,
            Err(_) => break,
        };

        if registered {
            if store(state, &id, report) {
                publish(app, state);
            }
        } else if register(state, &id, &device, report, sender.clone()) {
            registered = true;
            publish(app, state);
        } else {
            // Another transport got to this controller first. Keep reading
            // anyway, ready to take over the moment that one goes away.
            continue;
        }

        forward_to_emulation(state, &id, report, emulation);
    }

    if registered {
        state.controllers.lock().unwrap().remove(&id);
        publish(app, state);
    }
}

/// Takes the most recent queued output and discards the rest: while a color
/// slider is being dragged only the value the user landed on still matters.
fn latest(queued: &Receiver<OutputState>) -> Option<OutputState> {
    let mut output = None;
    while let Ok(queued) = queued.try_recv() {
        output = Some(queued);
    }
    output
}

/// Returns false if this controller is already tracked, which is what happens
/// when one pad is connected over USB and Bluetooth at the same time: two HID
/// devices, one MAC, and so one `DeviceId` between them.
fn register(
    state: &AppState,
    id: &DeviceId,
    device: &Ds4Device,
    report: Ds4Report,
    outputs: Sender<OutputState>,
) -> bool {
    let mut controllers = state.controllers.lock().unwrap();
    if controllers.contains_key(id) {
        return false;
    }

    controllers.insert(
        id.clone(),
        Controller {
            connection: device.connection(),
            vendor_id: device.vendor_id(),
            product_id: device.product_id(),
            is_v2: device.is_v2(),
            report,
            outputs,
        },
    );
    true
}

/// Stores the report and reports whether anything the user can actually see
/// changed, which is what keeps the UI from being updated at report rate.
fn store(state: &AppState, id: &DeviceId, report: Ds4Report) -> bool {
    let mut controllers = state.controllers.lock().unwrap();
    let Some(controller) = controllers.get_mut(id) else {
        return false;
    };

    let changed = controller.report.battery != report.battery
        || controller.report.charging != report.charging;
    controller.report = report;
    changed
}

fn forward_to_emulation(
    state: &AppState,
    id: &DeviceId,
    report: Ds4Report,
    emulation: &Sender<InputEvent>,
) {
    let enabled = state.mouse_emulation.load(Ordering::Relaxed)
        || state.stick_emulation.load(Ordering::Relaxed);

    if enabled && state.selected.lock().unwrap().as_ref() == Some(id) {
        let _ = emulation.send(InputEvent {
            id: id.clone(),
            report,
        });
    }
}

/// Pushes the current controller list to the tray icon and the frontend.
pub fn publish(app: &AppHandle, state: &AppState) {
    let views = views(state);
    tray_icon::update(app, &views);
    let _ = app.emit(CONTROLLERS_EVENT, &views);
}

/// Builds the frontend's view of every connected controller, in a stable order,
/// picking a new selection first if the selected pad has gone away.
pub fn views(state: &AppState) -> Vec<ControllerView> {
    let controllers = state.controllers.lock().unwrap();
    let mut selected = state.selected.lock().unwrap();
    let names = state.names.lock().unwrap();

    if !selected
        .as_ref()
        .is_some_and(|id| controllers.contains_key(id))
    {
        *selected = controllers.keys().min().cloned();
    }

    let mut ids: Vec<&DeviceId> = controllers.keys().collect();
    ids.sort();

    let mut totals: HashMap<&str, usize> = HashMap::new();
    for id in &ids {
        *totals.entry(model(controllers[*id].is_v2)).or_default() += 1;
    }

    let mut numbered: HashMap<&str, usize> = HashMap::new();
    ids.into_iter()
        .map(|id| {
            let controller = &controllers[id];
            let model = model(controller.is_v2);
            let nth = numbered.entry(model).or_default();
            *nth += 1;

            let default_label = if totals[model] > 1 {
                format!("{model} #{nth}")
            } else {
                model.to_string()
            };

            ControllerView {
                id: id.clone(),
                label: names.get(id.as_str()).cloned().unwrap_or(default_label),
                connection: controller.connection,
                battery: controller.report.battery,
                charging: controller.report.charging,
                vendor_id: controller.vendor_id,
                product_id: controller.product_id,
                is_v2: controller.is_v2,
                selected: selected.as_ref() == Some(id),
            }
        })
        .collect()
}

fn model(is_v2: bool) -> &'static str {
    if is_v2 {
        "DS4 v2"
    } else {
        "DS4 v1"
    }
}
