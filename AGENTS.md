# LINGUAL-DESKTOP AGENTS FIRMWARE

## 1. Package Metadata & Paths
- **Package**: `lingual-desktop` | **Entry**: `dist/main/main.js` (`src/main/main.ts`)
- **Native Helpers**: `bin/uia_helper.exe` and `bin/win32_helper.exe`
- **Config**: `~/.lingual/config.json`

## 2. Package Invariants
- **Driver-Level Keyboard Hook**: Native helper uses `SetWindowsHookEx(WH_KEYBOARD_LL)` with 0.00ms pass-through (`CallNextHookEx`); never hijack Enter globally (`globalShortcut.register("Enter")`).
- **Dynamic Island Capsule HUD**: Centered top-screen floating capsule; transitions between compact and expanded states use pure CSS; position persists in `~/.lingual/config.json` across drags.
- **Resilient 3.5s Draft Snapshots**: Poll active input controls via Win32 UIA every 30–60ms; fall back to cached 3.5s snapshot when target apps (Slack, WeChat, Discord) clear input on Enter.
- **Sleep Resume & Supervisor Self-Healing**: Monitor helpers via 5s supervisor heartbeat (18s timeout); auto-restart native watchers on `powerMonitor.on("resume")` with exponential backoff.
- **Reply Copilot (`Alt+R`)**: `executeReplyDraft` turns the selected inbound message into one native-language comprehension line plus three sendable replies classified by communication move (accept / decline / ask), never by tone. Replies use the sender's language; when the sender already writes the user's native language, switch to the language being practised. Never overwrite an existing draft: with non-empty input, copy instead of paste (`Alt+1/2/3` insert, `0` dismiss).
- **`pi-lingual/core` Bridge & UI Parity**: Consumes `pi-lingual` translation engine, slot topologies, and prompts; `mode === "off"` detaches passive watcher for 0% CPU.
- **Universal English Baseline & 10-Language Parity**: Source, logs, and default config stay English; `src/renderer/settings.js` carries every `data-i18n` key in all 10 UI languages (en, zh, zh-TW, ja, ko, es, fr, de, ru, pt) with zero untranslated residues.
- **Multi-Probe Test Isolation**: `tests/**/*.test.ts` must detect the test runtime (`NODE_TEST_CONTEXT`, `process.execArgv`) and never read or mutate the real host config `~/.lingual/config.json`.

## 3. Verification Commands
- `npm run build` (compiles native C# binaries and dual-bundles main/preload via tsup)
- `npm test` (or `node ../.scripts/fleet.mjs test lingual-desktop`)
