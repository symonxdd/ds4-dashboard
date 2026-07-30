---
title: Bugs & Quirks Fixed
description: Real bugs hit and fixed while building DS4 Dashboard, with the actual symptom, cause, and fix for each.
---

## Launch Minimized did nothing

**Symptom** ([reported by a user](https://github.com/symonxdd/ds4-dashboard/issues/1)): with both "Start with Windows" and "Launch Minimized" enabled, the dashboard window still popped up visibly every time Windows logged in. The user had to manually close it once (correctly minimizing to tray from then on, via the unrelated "Minimize to Tray" feature) before it behaved.

**Cause**: the autostart feature is powered by `tauri-plugin-autostart`, which writes a Windows Registry `Run` key entry so Windows launches the app at login. The Settings UI tried to pass a `--minimized` flag to that entry dynamically, re-sending it every time the toggle changed:

```js
// what the code did (didn't work)
const args = startMinimized ? ["--minimized"] : [];
await enable(args);
```

Two things made this silently do nothing. First, the installed plugin's JS `enable()` function doesn't accept an `args` parameter at all: the compiled function is `async function enable() { await invoke('plugin:autostart|enable'); }`, so whatever was passed was simply dropped before it left the frontend. Second, even on the Rust side, this plugin's args are fixed once, at plugin *registration* time (`tauri_plugin_autostart::init(launcher, args)`, called once when the app starts), not accepted per-call by its `enable` command. So no matter what the toggle was set to, the registry entry was always registered with zero arguments. On the Rust side, the code only ever hid the window when it found that flag present:

```rust
// src-tauri/src/lib.rs (before)
if args.contains(&"--minimized".to_string()) {
    window.hide();
}
```

Since the flag was never actually there, this branch never ran, and the window always showed.

**Fix**: since the plugin can't take dynamic args, the fix stopped trying to make it. The registered autostart entry now always includes a fixed `--minimized` marker, meaning "this launch came from the OS autostart entry" rather than "start hidden." The actual on/off preference is written to a small file on disk (`commands::set_start_minimized`) whenever the toggle changes, since Rust needs to read it during `.setup()`, before the webview (and therefore `localStorage`, where every other setting lives) exists at all:

```rust
// src-tauri/src/lib.rs (after)
let launched_via_autostart = std::env::args().any(|arg| arg == "--minimized");
let start_minimized = launched_via_autostart && commands::start_minimized_preference(app.handle());
if !start_minimized {
    window.show();
}
```

The main window is also now created hidden (`"visible": false` in `tauri.conf.json`) rather than visible-by-default-then-hidden, removing a possible flash on every launch, autostart or not.

One practical consequence: this only takes effect for *new* autostart registrations. A user who already had "Start with Windows" enabled before this fix needs to toggle it off and back on once, so the registry entry actually gets rewritten with the corrected setup.

## Bluetooth controllers reported 0% battery, mislabeled as USB

**Symptom**: connecting a DS4 over Bluetooth showed `0%` battery and reported the connection as USB, even though the controller was clearly paired over BT.

**Cause**: a DS4 boots into Bluetooth "basic mode" by default, sending small `0x01` reports with only stick/button data and no battery bytes at all. `0x01` is also exactly the report ID USB uses, so code that infers connection type from the report ID (rather than asking the OS) reads a basic-mode BT report and concludes "USB," and the battery byte it reads is just empty padding, hence `0%`.

**Fix**: connection type is read from `hidapi`'s own `bus_type()` instead of guessed from the report ID. Separately, sending Bluetooth feature report `0x02` once per connection (`send_bt_handshake`, via `get_feature_report`) switches the controller into "full mode," where it sends `0x11` reports carrying real battery and IMU data. Both fixes were necessary: reading `bus_type()` alone would have correctly labeled the connection as Bluetooth but still shown `0%`, since basic-mode reports never carry battery data regardless of how they're labeled.

## Taskbar icon didn't update in release builds (worked fine in dev)

**Symptom**: switching the app icon in Settings updated the window's title-bar icon immediately, in both dev and release builds. But the *taskbar* icon only ever updated live in dev mode; in a real installed release build, the taskbar button stayed stuck on the app's default icon no matter what was picked.

**Cause**: Windows groups a running process's taskbar button under a Start Menu shortcut's own static icon whenever it can match the process to a registered shortcut, and once grouped, that button ignores further runtime `WM_SETICON` updates entirely. The matching happens by file path: in dev, the app runs from a build output directory (e.g. `target/debug/`) with no shortcut pointing at it, so no match occurs and the taskbar behaves like a normal window, respecting live icon changes. In an installed release build, a Start Menu shortcut points directly at the installed `.exe` path, so Windows matches the running process to it, whether launched via the shortcut or the `.exe` directly, and locks the taskbar button to that shortcut's static icon from then on.

**Fix**: `icon_utils::set_explicit_app_user_model_id` assigns the process an explicit, custom AppUserModelID (`com.symon.ds4-dashboard.temp-aumid`) via the Win32 `SetCurrentProcessExplicitAppUserModelID` API, before any window is created. This decouples the running process from the Start Menu shortcut's registered identity, so Windows never groups it under the shortcut's static icon, and the taskbar button goes back to responding to `window.set_icon()` calls at runtime, matching dev-mode behavior in release builds too.

## Icons smaller than 256×256 were silently discarded

**Cause**: Windows' high-DPI shell drops icons submitted below 256×256 rather than upscaling them itself, so a smaller icon picked in Settings could simply fail to appear with no error.

**Fix**: `icon_utils::decode_ico_to_image` always upscales a chosen icon to 256×256 (Lanczos3 filtering) before handing it to `window.set_icon()`.

## latest.json pointed at a 404

**Symptom**: the very first live test of the [auto-update pipeline](architecture.md#release-pipeline) built and published a real signed release successfully, but the app's update check found the new version, downloaded it, and the download URL inside `latest.json` (the manifest file the updater reads to know what to fetch) turned out to be a `404 Not Found`.

**Cause**: the release workflow renames the built installer to a friendly, human-readable name (e.g. `DS4 Dashboard v1.5.0 Installer.exe`) before uploading it, and separately built the `latest.json` download URL by hand from that same name. GitHub, however, silently rewrites spaces in uploaded release-asset filenames to dots when it stores them, so that file actually ended up hosted as `DS4.Dashboard.v1.5.0.Installer.exe`. This isn't documented anywhere obvious; it only surfaced by actually publishing a release and checking the real asset URL against the one the workflow had guessed.

**Fix**: instead of guessing the URL, the workflow now uploads the installer first, then asks GitHub's own REST API for that asset's real `browser_download_url` (the exact address GitHub is actually serving it from) and writes that verbatim into `latest.json`. Verified by publishing two disposable test releases in a row: the first reproduced the 404, the second confirmed the fix by actually resolving.
