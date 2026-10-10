# lingual-desktop · Universal Ambient Language Companion Layer

> **The zero-friction desktop writing companion that lives alongside your existing IME.**  
> Type naturally with your preferred input method (Microsoft Pinyin, WeChat IME, Sogou, Rime) in any Windows app (X/Twitter, Slack, Discord, VS Code, Notion, WeChat, Email). Upon hitting submit, `lingual-desktop` intercepts, translates, and delivers authentic Silicon Valley spoken flow or technical RFC precision—while keeping you in complete flow state.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE) [![Tests: 12/12 Pass](https://img.shields.io/badge/Tests-12%2F12%20Pass-brightgreen)](tests/win32.test.ts) [![Platform: Windows](https://img.shields.io/badge/Platform-Windows%2010%2F11-blue)](https://microsoft.com)

**English** | [简体中文](README_zh.md)

---

## What is lingual-desktop?

`lingual-desktop` is **NOT a replacement for your input method**. You continue using your favorite Chinese IME without changing a single typing habit.

It is an **ambient, system-wide companion layer** that runs unobtrusively in your Windows system tray. It floats a gentle, non-activating micro-capsule (`⇄ [EN]`) near your typing caret. When you finish your thought and send:
* **English Mode (`[EN]`)**: Intercepts your native input, translates it into natural Silicon Valley tech prose via `@lingual/core`, injects the English directly into the host application, and submits—all while smoothly expanding a Left-Rail HUD for 3 seconds so you can verify what was sent and absorb idiomatic vocabulary.
* **Original Mode (`[ZH]`)**: 0ms non-blocking pass-through. Your original text sends instantly, while the Left-Rail HUD expands in the background to provide a dual-register comparison for micro-learning.
* **Off Mode (`[OFF]`)**: Fully transparent.

---

## Interaction Model

```
[Normal Typing State]
You type Chinese as usual in X, Slack, Discord, or VS Code using Microsoft Pinyin:
                      
   Caret ➔ 这个方案有点过度设计了，不如用标准库|  ⇄ [EN]  <-- Ambient Ghost Capsule (Non-activating)

────────────────────────────────────────────────────────────────────────────────────────────
[Submit State: Ctrl+Enter or Send]

  In English Mode:
  1. Intercepts submission via Windows UI Automation (zero clipboard pollution);
  2. Runs @lingual/core fast inference (Groq / Gemini / local Ollama);
  3. Auto-injects English into target control & triggers submit;
  4. Ambient capsule smoothly expands into Left-Rail HUD:
     · [Original] 这个方案有点过度设计了，不如用标准库
     ┌ [Spoken]   This feels a bit over-engineered; we'd be better off sticking with the standard library.
     │            (感觉过度设计了，用标准库划算得多)
     ├ [Written]  The proposed approach introduces unnecessary complexity. Standard library is preferred.
     │            (该方案引入了不必要的复杂度，建议优先采用原生实现)
     └ [Vocab]    over-engineered · be better off · stick with
     (Auto-closes in 3 seconds or on next keystroke)
```

---

## Key Engineering Pillars

### 1. Zero IME Replacement (Coexists with Any Input Method)
You do not need to learn a new keyboard layout or switch away from Microsoft Pinyin or Sogou. `lingual-desktop` hooks into text controls via **Windows UI Automation (UIA)** and caret telemetry, operating strictly at the submit/dispatch barrier.

### 2. Ambient Ghost Capsule (`WS_EX_NOACTIVATE`)
The micro-capsule stays docked beside your active caret without stealing typing focus.
* Click the capsule or press **`Alt+Q`** to toggle between **`[EN]`**, **`[ZH]`**, and **`[OFF]`**.

### 3. Configurable Dispatch (Auto-Send vs. Confirm-First)
* **Auto-Send (`autoSend: true`, Default)**: Submits the translated English immediately and shows the HUD for quick cognitive absorption.
* **Confirm Mode (`autoSend: false`)**: Pauses before sending, presenting `[1] Spoken` and `[2] Written` options. Press `1` or `2` to commit and submit.

### 4. Hybrid Zero-Pollution Injection (UIA + Atomic Clipboard Guard)
* **Primary**: Injects text directly into host controls via UIA `ValuePattern::SetValue` (0ms, zero clipboard interaction).
* **Fallback**: For custom canvas editors, utilizes an **Atomic Clipboard Transaction** that automatically rolls back your previous clipboard content after 160ms, keeping your Windows 11 `Win+V` history completely clean.

### 5. 0ms Code & CLI Shield
Inherited from `@lingual/core`, 40+ terminal command prefixes (`git`, `npm`, `cargo`, `docker`, `curl`, etc.) and multi-language code snippets pass through in 0ms without burning tokens.

### 6. Gabriel Design System v4 Settings Center (`⚙️ Settings`)
Right-click the system tray icon to open the GUI settings center, styled with the **Gabriel Design System v4 "Light Indigo"** aesthetic (clean white canvas, deep navy ink, hairline borders, and pill-shaped controls):
* **1-Click Provider Presets**: Instant configuration for DeepSeek, SiliconFlow, Groq (500 T/s), OpenAI, and local Ollama.
* **⚡ Live Latency Probe**: Test your endpoint connectivity and view round-trip latency in milliseconds.
* **3-Second Physical Recall Buffer**: When `autoSend` is enabled, press `Esc` within the 3-second countdown to instantly recall and restore your original native text.

### 7. Dynamic Dual-Slot Architecture (Domain-Specific Customization)
`[Spoken]` and `[Written]` are simply the defaults for **Slot 1** and **Slot 2**. Switch presets in the settings window to match your exact scenario:
* **💻 Developer Collaboration (Default)**: `[Spoken]` Silicon Valley Standup / Slack vs. `[Written]` RFC / PR Review Plain English
* **🐦 Twitter/X Social Growth (Targeted at Overseas Promotion)**: `[Hook]` Viral Social Hook vs. `[Deep]` Structured Technical Insight
* **🌸 Japanese Immersion**: `[口語]` Casual Tameguchi vs. `[敬語]` Business Polite Keigo
* **🎓 Academic Publishing**: `[Discussion]` Seminar / Lab Colloquy vs. `[Paper]` Peer-Reviewed Journal Prose

---

## Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Active Windows App                   │
│         (X / Browser, Slack, Discord, VS Code, Word)   │
└──────────────────────────┬─────────────────────────────┘
                           │ 1. Typing & Caret telemetry
                           ▼
┌────────────────────────────────────────────────────────┐
│              lingual-desktop Host Layer                │
│    (Electron + Native MinGW C & C# UIA Bridge)         │
│  - GetGUIThreadInfo caret tracking (< 2ms)             │
│  - UIA ValuePattern zero-clipboard text reading/set    │
│  - Ambient ghost capsule (WS_EX_NOACTIVATE)            │
│  - Submit interception gateway & Mode FSM              │
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
│             Smoothly Expanding Left-Rail HUD           │
│  Auto-Send: ✓ Submitted (3s auto-close)                │
│  Confirm:   [1] Spoken  │  [2] Written  │  [Esc]       │
└────────────────────────────────────────────────────────┘
```

---

## Quickstart & Verification

```bash
cd D:/Workspace/projects/lingual-desktop
npm install
npm run build   # Compiles native C/UIA helpers & main process
npm test        # 12/12 physical tests pass
npm start       # Launches the ambient companion background daemon
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
  "mode": "english",
  "autoSend": true,
  "showCapsule": true,
  "hotkeyToggleMode": "Alt+Q",
  "hotkeySubmit": "Ctrl+Enter",
  "hotkeyRewrite": "Alt+E",
  "hotkeySpotlight": "Alt+Space"
}
```

---

## License

MIT © [Jason Song](https://github.com/3ZEROS12)
