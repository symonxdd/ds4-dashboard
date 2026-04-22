# DS4 HID Protocol — Quick Reference

## Terminology

### HID Report ID
Every data packet the controller sends starts with a number that labels what *kind* of packet it is. Think of it like a letter's envelope saying "this is an invoice" vs "this is a receipt."

### 0x01 (Hexadecimal Notation)
That's hexadecimal notation. The `0x` prefix just means "this number is in hex." `0x01` = 1, `0x11` = 17, `0x1B` = 27. Read it as "hex one" or "hex eleven."

### Offset
Just means **position**. "Offset 29" = "the 30th slot in the data" (counting starts at 0).

### 0x01 = USB
The DS4 sends packets labeled `0x01` when connected via USB, and `0x11` when on Bluetooth (full mode). So the label tells us the connection type.

### "Opens the DS4"
Opens a *communication channel* to the controller's software interface. Like opening a file on your computer — you're not physically opening the controller, just starting to talk to it.

### VID / PID
**Vendor ID** and **Product ID**. Every USB/BT device has these hardcoded. `054C` = Sony. `09CC` = DualShock 4 v2. It's how software identifies what device is plugged in.

### `(raw report id: 0x01, length: 64, battery byte: 0x1B)`
Just debug info: the packet label was `0x01`, it was 64 bytes long, and the raw battery byte was `0x1B` (= 27 in decimal, which encodes both the charging flag and level).

---

## The Bluetooth Bug — Explained & Fixed

The DS4 over Bluetooth starts in **"basic mode"** — it sends small `0x01` reports with only stick/button data, **no battery info**. That's why you got `0%` and `USB` — the code saw report `0x01` and assumed USB, but the battery bytes were just empty padding.

The fix: to get battery data over Bluetooth, we must send feature report `0x02` to the controller. This tells the DS4 to switch to **"full mode"** (report `0x11` with battery/IMU data) instead of basic mode. We use `get_feature_report` in Rust to achieve this. We also use `bus_type()` from hidapi to reliably detect USB vs BT instead of guessing from the report ID.

### Battery Byte Breakdown (Offset 29 from input data start)

```
Byte layout:  [xxxx] [xxxx]
               ^^^^   ^^^^
               │       └── Lower 4 bits: raw battery level
               └────────── Bit 4 (0x10): charging flag (1 = charging)

When charging:  battery % = raw_level × 100 ÷ 11  (capped at 100)
When not:       battery % = raw_level × 100 ÷ 8   (capped at 100)
```

### Data Offsets Summary

| Connection | Report ID | Data Start (in hidapi buffer) | Battery Byte Position |
|------------|-----------|-------------------------------|-----------------------|
| USB        | `0x01`    | Position 1                    | Position 30 (1+29)    |
| Bluetooth  | `0x11`    | Position 3 (2 header bytes)   | Position 32 (3+29)    |
