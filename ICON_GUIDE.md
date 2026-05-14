# 🎨 DS4 Dashboard Icon Guide

Guide for adding new application icons and variants.

---

## 📂 1. The Assets
All custom icon files must be placed in: `public/alt-icons/`

Each icon style requires **two files** with the same base name:
1.  **.svg** (For the internal UI / Settings grid)
2.  **.ico** (For the Windows Taskbar and Title Bar)

---

## 🏷️ 2. Naming Convention
To keep the automation working, use the following format:
`{id}.{ext}` or `{id}-{variant}.{ext}`

**Examples:**
- `modern.svg` / `.ico`
- `modern-wired.svg` / `.ico`
- `snes.svg` / `.ico`

---

## ⚙️ 3. Registration
Add the new icon to the "Source of Truth" in: `src/constants/icons.js`

### Simple Icon
```javascript
{
  id: "snes",
  label: "Retro Style",
  author: "Creator Name",
  link: "https://...",
  path: "/alt-icons/snes.svg",
  glow: "rgba(255, 100, 100, 0.4)"
}
```

### Icon with Variants (e.g., Wired/Wireless)
```javascript
{
  id: "modern",
  label: "Modern Controller",
  // ... credits ...
  variants: [
    { id: "wired", label: "Wired", path: "/alt-icons/modern.svg" },
    { id: "wireless", label: "Wireless", path: "/alt-icons/modern-wireless.svg" }
  ]
}
```

---

## 📐 Specs & Best Practices
- **ICO Size:** 32x32px (The app auto-scales, but this is the native target).
- **SVG Format:** Flat vectors, no complex filters (filters are added via CSS).
- **Glow Color:** Use an RGBA color that matches the "vibe" of the icon.
- **IDs:** Use lowercase, no spaces (use hyphens for variants).
- **Naming:** Registry IDs must match the `.ico` filename base for automatic backend resolution.

---

## 🛠️ How it Works (The Pipeline)

The DS4 Dashboard uses a dual-layer icon system to handle both the internal UI (SVG) and the Windows system UI (ICO).

### 1. The Frontend (React)
- **Source of Truth:** `src/constants/icons.js` defines the registry.
- **UI Grid:** `GeneralTab.jsx` renders the grid. It reads the registry and determines which SVG path to display based on the selected variant.
- **Selection:** When a user clicks an icon or variant, the `appIcon` state is updated (e.g., `eren-yeagar` or `eren-yeagar_wireless`).
- **Persistence:** This state is saved to `localStorage` and sent to the backend via a Tauri command.

### 2. The Bridge (Tauri Command)
- The frontend calls `invoke('set_app_icon', { id: "eren-yeagar_wireless" })`.

### 3. The Backend (Rust)
- **Asset Embedding:** The `include_dir!` macro in `src-tauri/src/lib.rs` embeds the entire `public/alt-icons` folder into the binary at compile time. This means the app doesn't need external files to show custom icons.
- **Dynamic Resolution:** 
    - The backend splits the ID by `_` and joins it with `-` to form the filename.
    - Example: `eren-yeagar_wireless` becomes `eren-yeagar-wireless.ico`.
    - It looks up this file in the embedded `ALT_ICONS` directory.
- **System Integration:**
    - The `.ico` bytes are decoded into an RGBA image using the `image` crate.
    - The `window.set_icon()` method is called to update the Taskbar icon and the Title Bar icon in real-time.

### 4. Why "No Code Needed"?
Because the Rust code uses dynamic filename resolution (`format!("{}.ico", id.replace("_", "-"))`), you only need to add files to `public/alt-icons` and register them in `icons.js`. The backend handles the rest automatically without needing a recompile of the Rust logic.

---

## 🚀 Step-by-Step: Adding a New Icon

1.  **Prepare Assets:** Create `my-new-icon.svg` and `my-new-icon.ico`.
2.  **Place Files:** Drop them into `public/alt-icons/`.
3.  **Register:** Open `src/constants/icons.js` and add a new object to `ICON_REGISTRY`:
    ```javascript
    {
      id: "my-new-icon",
      label: "My New Icon",
      author: "Your Name",
      path: "/alt-icons/my-new-icon.svg",
      glow: "rgba(100, 200, 255, 0.5)"
    }
    ```
4.  **Save & Test:** The icon will immediately appear in the Settings -> General grid. Selecting it will update your Taskbar icon instantly.

### Adding Variants?
Just use the `variants` array instead of a `path` at the top level:
```javascript
{
  id: "my-icon",
  label: "Variant Icon",
  variants: [
    { id: "v1", label: "Variant 1", path: "/alt-icons/my-icon.svg" },
    { id: "v2", label: "Variant 2", path: "/alt-icons/my-icon-v2.svg" }
  ]
}
```
*Note: The first variant in the list is the default selection.*
