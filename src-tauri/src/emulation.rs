use std::sync::atomic::Ordering;
use std::sync::mpsc::{self, Sender};
use std::sync::Arc;
use std::thread;

use ds4_hid::{DeviceId, Ds4Report};
use enigo::{Button, Coordinate, Direction, Enigo, Mouse, Settings};

use crate::state::AppState;

/// A touchpad delta this large is a finger lifting and landing somewhere else,
/// not a drag.
const TOUCH_JUMP_LIMIT: i32 = 200;
const STICK_DEADZONE: i32 = 15;
/// Divides stick deflection (127 at full tilt) down to a sane pixel step.
const STICK_SENSITIVITY: i32 = 10;

pub struct InputEvent {
    pub id: DeviceId,
    pub report: Ds4Report,
}

/// Spawns the thread that drives the mouse from controller input.
///
/// It owns the only `Enigo` handle in the process, so however many controllers
/// are connected, exactly one of them can move the cursor at a time.
pub fn spawn(state: Arc<AppState>) -> Sender<InputEvent> {
    let (sender, events) = mpsc::channel::<InputEvent>();

    thread::spawn(move || {
        let mut enigo = match Enigo::new(&Settings::default()) {
            Ok(enigo) => enigo,
            Err(err) => {
                eprintln!("[emulation] unavailable, could not initialize input: {err}");
                return;
            }
        };

        let mut source: Option<DeviceId> = None;
        let mut touchpad = Touchpad::default();

        for event in events {
            if source.as_ref() != Some(&event.id) {
                touchpad.reset(&mut enigo);
                source = Some(event.id.clone());
            }

            if state.mouse_emulation.load(Ordering::Relaxed) {
                touchpad.apply(&mut enigo, &event.report);
            } else {
                touchpad.reset(&mut enigo);
            }

            if state.stick_emulation.load(Ordering::Relaxed) {
                move_by_stick(&mut enigo, &event.report);
            }
        }
    });

    sender
}

#[derive(Default)]
struct Touchpad {
    last_touch: Option<(i32, i32)>,
    pressed: bool,
}

impl Touchpad {
    fn apply(&mut self, enigo: &mut Enigo, report: &Ds4Report) {
        if report.touchpad_active {
            let touch = (i32::from(report.touchpad_x), i32::from(report.touchpad_y));

            if let Some((last_x, last_y)) = self.last_touch {
                let (dx, dy) = (touch.0 - last_x, touch.1 - last_y);
                if dx.abs() < TOUCH_JUMP_LIMIT && dy.abs() < TOUCH_JUMP_LIMIT {
                    let _ = enigo.move_mouse(dx, dy, Coordinate::Rel);
                }
            }
            self.last_touch = Some(touch);
        } else {
            self.last_touch = None;
        }

        if report.touchpad_button != self.pressed {
            self.pressed = report.touchpad_button;
            let direction = if self.pressed {
                Direction::Press
            } else {
                Direction::Release
            };
            let _ = enigo.button(Button::Left, direction);
        }
    }

    /// Drops any drag in progress, so switching controllers or turning emulation
    /// off can never leave the mouse button stuck down.
    fn reset(&mut self, enigo: &mut Enigo) {
        if self.pressed {
            let _ = enigo.button(Button::Left, Direction::Release);
        }
        *self = Self::default();
    }
}

fn move_by_stick(enigo: &mut Enigo, report: &Ds4Report) {
    let dx = i32::from(report.right_stick_x) - 128;
    let dy = i32::from(report.right_stick_y) - 128;

    if dx.abs() > STICK_DEADZONE || dy.abs() > STICK_DEADZONE {
        let _ = enigo.move_mouse(
            dx / STICK_SENSITIVITY,
            dy / STICK_SENSITIVITY,
            Coordinate::Rel,
        );
    }
}
