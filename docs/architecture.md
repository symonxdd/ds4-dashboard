---
title: Architecture
description: Tech stack, folder structure, and how HID communication, the tray gauge, and autostart work under the hood.
---

## Tech stack

- **[Tauri 2](https://tauri.app/)**: wraps a Rust backend and a system webview into a small native Windows app, instead of bundling a full Chromium runtime the way Electron does. This is why the shipped installer and running process footprint are both small relative to an equivalent Electron app.
- **Rust** backend (`src-tauri/`), talking to the controller over HID and exposing a handful of commands/events to the frontend.
- **React 19** frontend (`src/`), built with **Vite**.
- **`hidapi`**: cross-platform HID device access; used to find, open, and read/write reports to the DS4.
- **`enigo`**: OS-level mouse control, used only by the optional touchpad/stick-to-mouse emulation feature.
- **`framer-motion`**, **`lucide-react`**: UI animation and icons.

## Folder structure

```
ds4-dashboard/
├── crates/ds4-hid/       # Standalone HID protocol crate, no Tauri dependency
├── src-tauri/src/        # Tauri app: window/tray setup, commands, polling loop
├── src/                  # React frontend
├── docs/                 # This documentation (source of truth, also read by docs-site/)
└── docs-site/             # Astro + Starlight site that renders /docs
```

`ds4-hid` is deliberately its own crate with no `tauri` dependency: it only knows how to talk to a DS4 over HID, so it could be reused from a plain CLI tool or a different frontend without dragging in Tauri.

## The Rust ↔ React bridge

Tauri connects the two sides two ways:

- **Commands** (`src-tauri/src/commands.rs`): plain Rust functions annotated `#[tauri::command]`, registered in `invoke_handler![...]` in `lib.rs`, and called from React via `invoke("command_name", { args })`. Used for one-off actions the UI triggers: toggling the tray icon, setting the lightbar color, persisting a setting.
- **Events**: the backend pushes data to the frontend without being asked, via `app_handle.emit("event-name", payload)`, received in React with `listen("event-name", callback)`. The one event in use is `ds4-status-update`, carrying the latest `Ds4Status` (battery, charging, connection type, stick/touchpad state) roughly once a second.

## HID communication (`crates/ds4-hid`)

The DS4 is identified by a small table of known vendor/product ID pairs (covering v1 and v2 hardware, wired and wireless-dongle variants). Once found and opened:

- **USB reports** use report ID `0x01`; the payload starts at byte 1.
- **Bluetooth reports** use report ID `0x11`; the payload starts at byte 3. A DS4 over Bluetooth boots into a "basic mode" that only sends small `0x01` reports with stick/button data, no battery info at all: the same report ID USB uses, but without the trailing bytes battery parsing needs. Connection type is therefore never guessed from the report ID; it's read directly from `hidapi`'s own `bus_type()`. `send_bt_handshake` sends feature report `0x02` once per connection (`get_feature_report`), which switches the controller into "full mode" (`0x11` reports carrying battery/IMU data) before status reports are parsed.
- **Battery**: byte 29 of the payload packs both charge state and level: bit `0x10` is the charging flag, and the low nibble is a 0-11 (charging) or 0-8 (on battery) raw level, scaled to a 0-100 percentage. This is why the same raw value maps to a different displayed percentage depending on whether the controller is plugged in.
- **Sticks and touchpad**: parsed from further into the same report (stick axes as raw 0-255 bytes, center ~128; the first touch point's active flag, X/Y as 12-bit values split across three bytes).
- **Output reports** (lightbar color + rumble) are a different shape per transport: a 32-byte report on USB, and a 78-byte report over Bluetooth that additionally needs a CRC-32 (the same `CRC_32_ISO_HDLC` polynomial as zlib) computed over the report body and appended, or the controller silently ignores it.

## The polling loop (`src-tauri/src/polling.rs`)

A single background thread, spawned once at startup, drives everything hardware-related:

1. Every 10ms: if no device is open, try to find and open one (so plugging in / turning on a controller is picked up without restarting the app); if one is open, read its latest status report.
2. If mouse or stick emulation is enabled in settings, translate touchpad deltas or right-stick deflection into relative mouse movement via `enigo`, every tick, for responsiveness.
3. Every 100th tick (~once a second): regenerate the tray icon, update its tooltip, and emit `ds4-status-update` to the frontend. This is deliberately throttled separately from the 10ms input-emulation loop, since redrawing a 32×32 icon and re-rendering React 100 times a second would be wasted work.

If a device disconnects mid-read, the loop clears its handle and falls back to searching again on the next tick, so reconnecting (or switching a controller between USB and Bluetooth) is handled automatically rather than requiring an app restart.

## The tray battery gauge (`src-tauri/src/tray_icon.rs`)

The tray icon isn't a static asset switched between a few fixed states; it's generated pixel-by-pixel at runtime, every update. `generate_battery_icon_raw` draws a 32×32 RGBA buffer directly: a 240°-arc "gauge" ring (open at the bottom) with a colored fill proportional to battery percentage, an angle computed per-pixel with `atan2`. Fill color depends on state (green above 70%, yellow above 30%, red below, sky-blue while charging, grey with an "X" glyph when disconnected), matching the same thresholds the in-app gauge UI uses.

## Window, tray, and app-icon setup (`src-tauri/src/lib.rs`)

App startup, in order:

1. Sets an explicit Windows **AppUserModelID** (`icon_utils::set_explicit_app_user_model_id`) before anything else. Without this, Windows groups the running process under the Start Menu shortcut's own static icon, silently overriding any dynamic taskbar icon changes made later.
2. Registers the `tauri-plugin-autostart` plugin (see [Launch at login](#launch-at-login-and-start-minimized) below) and the app's shared `AppState` (device handles, current status, and the various feature toggles, all behind `Mutex`es since the polling thread and the command handlers both touch them).
3. In `.setup()`: decides whether to show the main window immediately or leave it hidden (see below), builds the tray icon and its right-click menu (Show/Quit), and spawns the polling thread.

### App icon switching

The app ships several alternate icon styles (`public/alt-icons/`) alongside the default (`src-tauri/icons/`), both embedded directly into the binary at compile time via `include_dir!` rather than read from disk at runtime. Switching icons (`commands::set_app_icon`) decodes the chosen `.ico` from that embedded set and calls `window.set_icon()`; icons are upscaled to 256×256 with Lanczos3 filtering first, since Windows' high-DPI shell silently discards icons submitted smaller than that.

### Launch at login and start minimized

Autostart is handled by `tauri-plugin-autostart`, which writes a Windows Registry `Run` key entry pointing at the app's `.exe`. That plugin's args are fixed once, at plugin *registration* time in `lib.rs`, not dynamically per toggle, so the "start minimized" preference can't be threaded through it directly. Instead:

- The registered autostart entry always includes a fixed `--minimized` marker arg, meaning "this launch came from the OS autostart entry" (not "start hidden").
- The actual preference is written to a small file on disk (`commands::set_start_minimized`) whenever the user flips the toggle, since it needs to be readable by Rust during `.setup()`, before the webview (and therefore `localStorage`) exists.
- At startup, the main window (created hidden, per `tauri.conf.json`) is shown immediately unless both the marker arg is present *and* the persisted preference says to stay hidden.

See [bugs-and-quirks.md](bugs-and-quirks.md#launch-minimized-did-nothing) for the full story of why this couldn't just be "pass `--minimized` conditionally."

## Settings persistence

Most settings (theme, tray visibility, close-to-tray, mouse/stick emulation, lightbar color, app icon) live in the frontend's `localStorage` and are pushed to Rust via a command on every change, since Rust only needs to know their current value while the app is already running. The one exception is "start minimized," which has to be known *before* the frontend exists at all, so it's persisted to disk instead (see above).

## Theming

`ThemeContext` (`src/context/ThemeContext.jsx`) supports `light`, `dark`, and `system_default`, persisted to `localStorage`. It sets a `data-theme` attribute plus a matching class on `<html>`, and the actual colors are defined as CSS custom properties in `src/theme.css`, one block per theme, consumed throughout the component CSS via `var(--...)`.

## Release pipeline

Covered in the [main README](https://github.com/symonxdd/ds4-dashboard#-release-workflow): `npm run release` bumps the version, commits, tags, and pushes; the tag push triggers `.github/workflows/release.yml`, which builds the Windows installer and publishes it as a GitHub Release.
