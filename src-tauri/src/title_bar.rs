//! Paints the native title bar to match the app's own background, so the window
//! reads as one surface instead of the app sitting under a system colored bar.

use std::ffi::c_void;

use tauri::WebviewWindow;

/// Windows 11 (build 22000) and later accept an exact caption color. Earlier
/// builds only understand the light/dark switch, so they fall back to that.
const DWMWA_USE_IMMERSIVE_DARK_MODE: u32 = 20;
const DWMWA_BORDER_COLOR: u32 = 34;
const DWMWA_CAPTION_COLOR: u32 = 35;
const DWMWA_TEXT_COLOR: u32 = 36;

#[cfg(target_os = "windows")]
#[link(name = "dwmapi")]
extern "system" {
    fn DwmSetWindowAttribute(hwnd: isize, attribute: u32, value: *const c_void, size: u32) -> i32;
}

/// Must match `--bg-app` and `--text-primary` in src/theme.css for each theme.
const LIGHT_CAPTION: (u8, u8, u8) = (243, 243, 243);
const LIGHT_TEXT: (u8, u8, u8) = (55, 55, 55);
const DARK_CAPTION: (u8, u8, u8) = (6, 6, 6);
const DARK_TEXT: (u8, u8, u8) = (243, 243, 243);

pub fn apply(window: &WebviewWindow, is_light: bool) {
    #[cfg(target_os = "windows")]
    {
        let Ok(handle) = window.hwnd() else {
            return;
        };
        let hwnd = handle.0 as isize;

        let (caption, text) = if is_light {
            (LIGHT_CAPTION, LIGHT_TEXT)
        } else {
            (DARK_CAPTION, DARK_TEXT)
        };
        let (caption, text) = (colorref(caption), colorref(text));

        if set_attribute(hwnd, DWMWA_CAPTION_COLOR, &caption) != 0 {
            let use_dark: i32 = if is_light { 0 } else { 1 };
            set_attribute(hwnd, DWMWA_USE_IMMERSIVE_DARK_MODE, &use_dark);
            return;
        }

        set_attribute(hwnd, DWMWA_TEXT_COLOR, &text);
        set_attribute(hwnd, DWMWA_BORDER_COLOR, &caption);
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = (window, is_light);
    }
}

/// A COLORREF packs the channels as `0x00BBGGRR`, the reverse of a CSS hex color.
fn colorref((r, g, b): (u8, u8, u8)) -> u32 {
    u32::from(r) | (u32::from(g) << 8) | (u32::from(b) << 16)
}

#[cfg(target_os = "windows")]
fn set_attribute<T>(hwnd: isize, attribute: u32, value: &T) -> i32 {
    unsafe {
        DwmSetWindowAttribute(
            hwnd,
            attribute,
            value as *const T as *const c_void,
            std::mem::size_of::<T>() as u32,
        )
    }
}
