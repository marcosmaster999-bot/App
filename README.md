# DeX-Desktop-Android

A DeX-like desktop environment launcher for Android with floating windows and USB input mapping.

## 🧩 System Architecture

```text
+-------------------------------------------------------+
|                   DesktopShell (UI)                   |
|  +----------------+  +-----------------------------+  |
|  |    Taskbar     |  |       Window Manager        |  |
|  +----------------+  |  +-----------------------+  |  |
|                      |  |   Floating Windows    |  |  |
|                      |  +-----------------------+  |  |
|                      +-----------------------------+  |
+-------------------------------------------------------+
|                    InputManager                       |
|  +----------------+  +-----------------------------+  |
|  | USB Controller |  |   Input Abstraction Layer   |  |
|  +----------------+  +-----------------------------+  |
+-------------------------------------------------------+
|                   Android System                      |
|  +----------------+  +-----------------------------+  |
|  | USB Accessory  |  |      Display Manager        |  |
|  +----------------+  +-----------------------------+  |
+-------------------------------------------------------+
```

### Core Modules
1. **DesktopShell**: Main UI container using Jetpack Compose or React (for prototype).
2. **WindowManager**: Manages window states, z-index, and focus.
3. **InputManager**: Maps USB HID or AOA packets to virtual cursor events.
4. **USBController**: Handles low-level USB communication via `UsbManager`.
5. **DisplayManager**: Detects and renders on external displays.

---

## 🔌 USB Communication Protocol (Mode B: AOA)

Packet Format (Binary):
- Byte 0: Type (0x01: MOVE, 0x02: CLICK, 0x03: SCROLL)
- Bytes 1-4: X (Float32)
- Bytes 5-8: Y (Float32)
- Byte 9: Action (0x00: UP, 0x01: DOWN, 0x02: MOVE)
- Bytes 10-17: Timestamp (Int64)

---

## 📦 Build Instructions

### Android App
1. Open the project in **Android Studio**.
2. Ensure you have the **Android SDK 33+** installed.
3. Add the following permissions to `AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.USB_PERMISSION" />
   <uses-feature android:name="android.hardware.usb.accessory" />
   ```
4. Build and deploy to an Android device.
5. Connect an external device via USB to trigger Accessory Mode.

### Web Prototype (Simulation)
1. Run `npm install`.
2. Run `npm run dev`.
3. Use the **USB Simulator** panel in the top-right to simulate external input.

---

## 🧪 Testing
- **Latency**: Target < 50ms. Measured from USB packet arrival to UI update.
- **Multi-window**: Stress test with 10+ windows to ensure z-index and focus logic holds.
- **USB HID Fallback**: Test with standard USB mouse/keyboard.
