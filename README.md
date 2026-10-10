# lingual-desktop

> **Universal Windows Dual-Register Writing Companion & In-Situ Language Bridge**  
> Type naturally in your native language across any application (X/Twitter, Slack, Discord, VS Code, Notion, Email) and transform your thoughts into authentic Silicon Valley spoken flow or technical RFC precision with a single keystroke.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE) [![Tests: 8/8 Pass](https://img.shields.io/badge/Tests-8%2F8%20Pass-brightgreen)](tests/win32.test.ts) [![Platform: Windows](https://img.shields.io/badge/Platform-Windows%2010%2F11-blue)](https://microsoft.com)

**English** | [简体中文](README_zh.md)

---

## Why lingual-desktop?

When writing in a target language across desktop apps, developers and creators face a recurring friction cycle:

1. **The Alt+Tab Penalty**: Switching back and forth between your active window and translation software (DeepL, Google Translate, ChatGPT) breaks flow state.
2. **The "Mechanical Flatness" Trap**: Traditional machine translation flattens human nuance into textbook literalisms. It doesn't understand the difference between Silicon Valley developer banter on Slack or an engaging hook on X versus formal RFC technical prose.
3. **The "Black Box Fear"**: Tools that blindly overwrite text with AI deprive the writer of cognitive feedback—you don't know if the nuance is accurate, and you learn nothing.

`lingual-desktop` runs as a featherweight, system-wide intermediate layer in your Windows system tray. It bridges your native thoughts into idiomatic English right where your cursor is, without replacing your input method.

---

## Core Capabilities

```
  · [Original] 这个方案有点过度设计了，不如直接用标准库实现
  [1] ┌ [Spoken]   This feels a bit over-engineered; we'd be much better off sticking with the standard library.
      │            (感觉有点过度设计了，用标准库划算得多)
  [2] ├ [Written]  The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.
      │            (该方案引入了不必要的复杂度，建议优先采用原生标准库实现)
      └ [Vocab]    over-engineered · be better off · stick with · leverage
  ────────────────────────────────────────────────────────────────────────
  [1] Spoken · [2] Written · [Esc] Cancel
```

### 1. In-Situ Selection Rewrite (`Alt+E`)
Select text in any Windows app (a tweet composer, Slack message, GitHub issue, or IDE comment) and press `Alt+E`. A floating Left-Rail HUD docks directly adjacent to your caret:
* Press **`1`**: Injects natural colloquial English (Slack, X hooks, agile banter).
* Press **`2`**: Injects architecture-grade technical English (PRs, RFCs, issues).
* Press **`Esc`**: Dismisses the HUD, leaving original text intact.

### 2. Spotlight Thought Capsule (`Alt+Space`)
When drafting a new thought from scratch, press `Alt+Space` anywhere. A minimalist input capsule appears on screen:
* Type your thoughts in native language and press `Enter`.
* Review the dual-register preview.
* Press `1` or `2` to inject the translation directly into whichever window was previously active.

### 3. Atomic Clipboard Guard
Unlike rudimentary rewriters that hijack and corrupt your clipboard, `lingual-desktop` wraps every paste in an **Atomic Transaction**:
* Backs up your existing clipboard before pasting.
* Injects replacement text.
* Automatically rolls back your original clipboard history after 160ms, keeping your Windows 11 `Win+V` clipboard history completely clean.

### 4. 0ms Code & CLI Shield
Inherited from `@lingual/core`, `lingual-desktop` features a 0.1ms rule-based shield:
* 40+ shell command prefixes (`git`, `npm`, `cargo`, `docker`, `curl`, etc.) and multi-language code statements pass through immediately without burning tokens.

### 5. Local-First & Model Decoupled
* **Default**: Seamlessly connects to local Ollama (`http://127.0.0.1:11434`, e.g. `qwen2.5:3b`) for 100% offline, zero-cost, zero-latency inference.
* **Cloud**: Configure OpenAI-compatible endpoints (Groq, DeepSeek, OpenAI, Gemini) via `~/.lingual/config.json`.

---

## Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Active Windows App                   │
│         (X / Browser, Slack, Discord, VS Code, Word)   │
└──────────────────────────┬─────────────────────────────┘
                           │ 1. Alt+E (Selection) / Alt+Space (Spotlight)
                           ▼
┌────────────────────────────────────────────────────────┐
│              lingual-desktop Host Layer                │
│             (Electron + Native MinGW C Bridge)         │
│  - GetGUIThreadInfo caret tracking (< 2ms)             │
│  - Atomic clipboard transaction guard                  │
│  - Win32 SetForegroundWindow focus restoration         │
└──────────────────────────┬─────────────────────────────┘
                           │ 2. Text payload
                           ▼
┌────────────────────────────────────────────────────────┐
│           @lingual/core Language Engine                │
│  - shield.ts:   0ms code/CLI pass-through              │
│  - cache.ts:    50-entry LRU cache                     │
│  - prompts.ts:  Dual-register generation & vocab       │
└──────────────────────────┬─────────────────────────────┘
                           │ 3. Streamed result
                           ▼
┌────────────────────────────────────────────────────────┐
│            Frameless Left-Rail Floating HUD            │
│      [1] Spoken  │  [2] Written  │  [Esc] Dismiss      │
└────────────────────────────────────────────────────────┘
```

---

## Quickstart & Verification

```bash
cd D:/Workspace/projects/lingual-desktop
npm install
npm run build   # Compiles native C helper & main process
npm test        # 8/8 physical tests pass
npm start       # Launches system tray background daemon
```

---

## Configuration (`~/.lingual/config.json`)

```json
{
  "endpoint": "http://127.0.0.1:11434/v1/chat/completions",
  "apiKey": "ollama",
  "model": "qwen2.5:3b",
  "sourceLang": "zh",
  "targetLang": "en",
  "hotkeyRewrite": "Alt+E",
  "hotkeySpotlight": "Alt+Space"
}
```

---

## License

MIT © [Jason Song](https://github.com/3ZEROS12)
