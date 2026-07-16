---
title: DS4 Dashboard documentation
description: Documentation for DS4 Dashboard, a Tauri + Rust + React battery monitor and lightbar/rumble controller for the DualShock 4 on Windows.
---

DS4 Dashboard is a lightweight Windows utility for monitoring a DualShock 4 controller's battery level and customizing its lightbar and rumble, over both USB and Bluetooth. It talks to the controller directly over HID, with no dependency on DS4Windows or any other driver.

This site documents how the app is built. For downloads, screenshots, and the story behind the project, see the [main repo README](https://github.com/symonxdd/ds4-dashboard) or the [project website](https://ds4-dashboard.vercel.app).

## What it does

- **Battery monitoring**: real-time percentage, charging state, and connection type (USB/Bluetooth), read directly from the controller's HID input report.
- **Lightbar & rumble control**: pick a lightbar color and preview small/large rumble motors at any time, independent of whatever game or app currently has the controller open.
- **System tray integration**: a small tray icon renders a live battery gauge (an arc drawn pixel-by-pixel, not a static asset) so battery level is visible without opening the window at all.
- **Launch at login**: optionally starts with Windows, optionally minimized straight to the tray.
- **Mouse/stick emulation**: optionally translates touchpad drags or right-stick deflection into OS-level mouse movement.
- **Light/dark theme**, plus a set of alternate taskbar/tray icon styles.

## Where to go next

| Doc | What's in it |
|---|---|
| [architecture.md](architecture.md) | Tech stack, folder structure, the Tauri/Rust ↔ React bridge, and how HID communication, the tray gauge, and autostart actually work |
| [features.md](features.md) | Every user-facing feature, and the implementation detail behind each one |
| [bugs-and-quirks.md](bugs-and-quirks.md) | Real bugs hit and fixed while building this app, with the actual symptom, root cause, and fix for each |

## Quick map of the codebase

| Path | Contains |
|---|---|
| `src/` | React frontend: dashboard UI, settings modal, theme context |
| `src-tauri/src/` | Tauri/Rust backend: window & tray setup, Tauri commands, the polling loop |
| `crates/ds4-hid/` | Standalone Rust crate with no Tauri dependency: raw HID report parsing for the DS4 (battery, sticks, touchpad, lightbar/rumble output) |
| `.github/workflows/release.yml` | Builds and publishes a new GitHub Release whenever a `v*` tag is pushed |
| `scripts/release.cjs` | Interactive helper that bumps the version, commits, tags, and pushes, triggering the release workflow above |

See [architecture.md](architecture.md) for why the code is split this way, and what lives in each piece.

## Development notes

Parts of this project were built with AI assistance from [Claude Code](https://claude.com/claude-code), used in a supporting role under close direction. Every line it produces, frontend and backend alike, is read and reviewed, and redirected whenever it suggests something that isn't best practice.
