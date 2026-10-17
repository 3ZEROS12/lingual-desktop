# SYSTEM CONTEXT & OPERATIONAL PROFILE: LINGUAL-DESKTOP

## 1. Domain & Runtime Environment (RFC 2119)
- **Package / Target**: `lingual-desktop` (v0.2.18)
- **Primary Domain**: Universal Windows dual-register writing companion & Dynamic Island HUD (`pi-lingual/core` bridge).
- **Runtime & Toolchain**: Electron / Node.js `>=20` / TypeScript Strict / Win32 C# UIA & Low-Level Keyboard Hooks (`WH_KEYBOARD_LL`).
- **Main Entry**: `dist/main/main.js` (authored in `src/main/main.ts`).
- **Configuration Path**: `~/.lingual/config.json`.

---

## 2. Core Operational Invariants (Strict RFC 2119)

### Invariant 1: Driver-Level Low-Level Keyboard Hook (`WH_KEYBOARD_LL`)
- Native Windows helper (`bin/uia_helper.exe`) MUST utilize low-level keyboard hook (`SetWindowsHookEx(WH_KEYBOARD_LL, ...)`) with zero-latency pass-through (`CallNextHookEx`).
- **Strict Prohibition**: NEVER hijack or block the Enter key globally (`globalShortcut.register("Enter")`), which breaks host typing across external applications.
- Pass-through latency MUST remain 0.00ms so native typing rhythm is never degraded.

### Invariant 2: Dynamic Island Capsule HUD
- The floating capsule window resides centered at the top of the active display by default, maintaining a stable, drift-free anchor.
- Smooth transitions between compact idle capsule and expanded HUD window MUST use pure CSS transitions without jarring window resizing.
- Support seamless user drag-and-drop repositioning with permanent position persistence in `~/.lingual/config.json`.

### Invariant 3: Resilient Draft Snapshots & Cache Fallback
- Maintain high-frequency background input snapshots (30–60ms) of active input controls via Win32 UIA.
- When target applications (Slack, WeChat, Discord) clear the input box upon Enter, the engine MUST seamlessly fall back to the cached 3.5s draft snapshot to guarantee zero missing prompts.

### Invariant 4: Sleep Resume & Process Supervisor Self-Healing
- Background helper processes (`bin/uia_helper.exe`, `bin/win32_helper.exe`) MUST be monitored via a 5-second supervisor heartbeat (18s timeout).
- Upon system sleep resume (`powerMonitor.on("resume")`), the main process MUST automatically restart the native watcher and re-hook low-level listeners without requiring an application restart.
- Use exponential backoff restart guards to prevent runaway crash loops.

### Invariant 5: Universal English Baseline & Symmetric Polyglot Parity (Invariant 18)
- All generic code comments, log messages, and default configuration schemas MUST default strictly to Universal English.
- The Settings UI (`src/renderer/settings.html`) MUST provide 100% symmetric i18n support across all 9 supported languages (English, Japanese, Chinese, Traditional Chinese, Korean, Spanish, French, German, Russian) with zero untranslated foreign residues.

### Invariant 6: Core Engine Handshake (`pi-lingual` Bridge)
- `lingual-desktop` consumes `pi-lingual`'s core translation engine, slot topologies, and system prompts via `pi-lingual/core`.
- Maintain exact mode parity: `original` (companion), `english` (direct), `select` (candidates), `modify` (live-flow), and `off`.
- When `mode === "off"`, the background passive watcher MUST be detached to consume 0% background CPU.

### Invariant 7: Multi-Probe Test Isolation Sandbox
- Test suites (`tests/**/*.test.ts`) MUST automatically detect test execution environments (`NODE_TEST_CONTEXT`, `process.execArgv`, npm lifecycle events) and strictly avoid touching the user's real host configuration files (`~/.lingual/config.json`).

---

## 3. Physical Verification & Build Commands

- **Build Main & Native Bundles**:
  ```bash
  npm run build
  # compiles native C# binaries and dual-bundles main (ESM) + preload (CJS) via tsup
  ```

- **Run Physical Test Suite**:
  ```bash
  npm test
  # or from workspace root: node .scripts/fleet.mjs test lingual-desktop
  ```
  *Executes 28 test suites verifying config, logger, engine, shortcuts, and win32 hooks (100% green).*
