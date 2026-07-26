---
title: Features
description: Every user-facing feature in DS4 Dashboard, and the implementation detail behind each one.
---

## Battery gauge

The main dashboard shows an arc-shaped gauge (`Gauge.jsx`, SVG-based) with the battery percentage, connection icon (USB or Bluetooth), and a charging indicator when plugged in. Fill color follows the controller's charge state: green above 70%, yellow above 30%, red below that, sky-blue while charging, regardless of percentage. The [tray icon](#tray-icon--tray-behavior) mirrors these exact same thresholds and colors in a separately hand-drawn 32×32 version, so the two never disagree.

When no controller is connected, the gauge is empty and a neutral status pill reads "No controller connected" underneath it.

## Lightbar & rumble

An expandable panel (`ColorPicker.jsx`), shown only while a controller is connected:

- **Color**: R/G/B sliders (0-255 each), plus six one-tap presets (PS Blue, Soft Red, Green, Pink, Amber, Pure White).
- **Brightness**: a separate 0-100% slider applied as a multiplier on top of the chosen RGB before it's sent to the controller, so brightness and color stay independently adjustable.
- **Rumble**: separate weak-motor and strong-motor sliders (0-255 each), for previewing haptics outside of any game.

Every slider drag sends an update immediately, throttled through a small queue (at most one in-flight `set_output_state` call at a time, a 10ms gap between sends) so rapid dragging can't flood the controller with overlapping HID writes. The last-sent color and rumble values are cached on the Rust side and automatically re-applied the moment a controller (re)connects, so unplugging and replugging, or switching a controller from USB to Bluetooth, doesn't reset the lightbar to its default color.

## Device info

An info-icon modal (`DeviceInfoModal.jsx`) showing the connected controller's model (v1 vs v2, detected from its USB product ID), and its raw vendor/product ID in hex, read directly over HID.

## Tray icon & tray behavior

The system tray icon is a live battery gauge, redrawn roughly once a second directly in Rust (see [architecture.md](architecture.md#the-tray-battery-gauge-src-taurisrctray_iconrs)), not a static icon swapped between a few fixed states. Hovering it shows a tooltip with the exact percentage, connection type, and a charging indicator.

Two independent settings control tray behavior:

- **Show Tray Icon**: whether the tray icon exists at all. Turning it off also force-disables "Minimize to Tray" below, since there'd be nowhere to minimize to.
- **Minimize to Tray**: when enabled, closing the main window hides it to the tray instead of quitting the app; quitting is then only possible from the tray icon's right-click menu.

## Launch at login / start minimized

Under Settings → General:

- **Start with Windows**: registers the app to launch automatically at login (via a Windows Registry `Run` key entry).
- **Launch Minimized** (shown only once the above is on): when enabled, an autostart-triggered launch stays hidden in the tray instead of showing the window. A normal, manual launch (double-clicking the app or its Start Menu shortcut) always shows the window regardless of this setting. See [architecture.md](architecture.md#launch-at-login-and-start-minimized) for how this is actually implemented, and [bugs-and-quirks.md](bugs-and-quirks.md#launch-minimized-did-nothing) for why it originally didn't work.

## Mouse & stick emulation (experimental)

Under Settings → Emulation, two independent, optional ways to drive the OS mouse cursor from the controller, useful for basic navigation without switching to a mouse:

- **Touchpad Mouse**: dragging a finger on the DS4's touchpad moves the cursor by the same relative delta (large single-tick jumps, e.g. from a finger lifting and landing elsewhere, are filtered out so they don't teleport the cursor). A touchpad click is forwarded as a left mouse click.
- **Joystick Mouse**: right-stick deflection past a small deadzone moves the cursor continuously, scaled down from the stick's raw range so it's controllable rather than twitchy.

Both work by reading the same HID reports already being polled for battery status, so enabling them adds no extra hardware polling.

## Themes & app icons

- **Theme**: light, dark, or "follow system," toggled from the icon in the top-left corner; persisted across restarts. Colors are defined once per theme as CSS custom properties (`src/theme.css`) and referenced everywhere else via `var(--...)`, so there's a single source of truth per theme rather than scattered color literals.
- **App icon**: several alternate taskbar/tray icon styles to choose from in Settings → General, swapped live without restarting the app.
