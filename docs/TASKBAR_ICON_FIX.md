# Windows Taskbar Icon Update Behavior and Fix

This document describes the behavior of Windows taskbar icon updates, the difference in behavior between development and release environments, and the technical implementation used to resolve issues where dynamic icon changes fail in production.

---

## Technical Concepts

### 1. AppUserModelID (AUMID)
The Application User Model ID is a unique string identifier used by the Windows Shell to identify a process, group its windows under a single taskbar button, and associate it with notifications and Start Menu shortcuts. The standard format is `Company.Product.SubProduct.Version`.

### 2. Taskbar Grouping Heuristic
Windows groups taskbar buttons dynamically based on AUMIDs. If a process does not explicitly set an AUMID, the Windows Shell automatically calculates one using heuristics based on the executable's file path.

### 3. Shortcut Association
When an application is installed, the installer registers a Start Menu shortcut that contains the application's declared AUMID. When a process runs, Windows attempts to map the process to this registered shortcut. If the process's AUMID (either explicitly declared or calculated via path heuristics) matches the shortcut's AUMID, the taskbar button is grouped under that shortcut.
In this state, the taskbar button displays the static icon defined by the shortcut (or the primary resource icon embedded inside the executable) and ignores dynamic runtime window-level icon updates.

---

## The Cause of the Defect

### Dev Mode Behavior (Successful Icon Update)
In the development environment:
1. The application is run from a temporary build output directory (e.g., `target/debug/`).
2. No registered Start Menu shortcut exists that matches the development executable's file path.
3. Windows fails to map the running process to an installed shortcut.
4. Because no shortcut association occurs, the taskbar button falls back to standard window behavior and dynamically respects the `WM_SETICON` window message sent during `window.set_icon` calls.

### Release Mode Behavior (Failed Icon Update)
In the production/release environment:
1. The application is packaged, installed, and registered with a Start Menu shortcut pointing to the installation path (e.g., `C:\Program Files\DS4 Dashboard\DS4 Dashboard.exe`).
2. Even if launched directly from the folder (rather than through the shortcut), the file path matches the registered Start Menu shortcut target.
3. Windows Shell automatically associates the running process with the shortcut.
4. Due to this association, the taskbar button is bound to the static shortcut icon, discarding any runtime `window.set_icon` overrides. The icon updates in the window's title bar frame, but remains unchanged on the taskbar.

---

## The Resolution

To allow runtime taskbar icon updates in production, the automatic association between the running process and the installed shortcut must be bypassed. This is achieved by assigning the running process a custom/temporary AUMID at startup, before any user interface windows are created.

### Implementation Details
During startup, the application calls the native Win32 Shell API `SetCurrentProcessExplicitAppUserModelID` with a custom ID:

```rust
#[cfg(target_os = "windows")]
#[link(name = "shell32")]
extern "system" {
    fn SetCurrentProcessExplicitAppUserModelID(AppID: *const u16) -> i32;
}
```

By assigning a distinct ID, such as `com.symon.ds4-dashboard.temp-aumid`:
1. The process is decoupled from the Start Menu shortcut's registered identity.
2. Windows Shell stops forcing the shortcut's static icon representation.
3. The taskbar button reverts to standard Win32 window-level behavior, allowing dynamic `window.set_icon` calls to update the taskbar icon in real time.
