# lingual-desktop · Universal Ambient Language Companion Layer

> **The zero-friction desktop writing companion that lives alongside your existing IME.**  
> Type naturally with your preferred input method (Microsoft Pinyin, WeChat IME, Sogou, Rime) in any Windows app (X/Twitter, Slack, Discord, Chrome, Notion, WeChat, Email). Upon pressing Enter, `lingual-desktop` automatically detects natural language, translates via your chosen engine, and delivers authentic spoken flow or technical precision—while keeping you in complete flow state.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE) [![Tests: 24/24 Pass](https://img.shields.io/badge/Tests-24%2F24%20Pass-brightgreen)](tests/engine.test.ts) [![Platform: Windows](https://img.shields.io/badge/Platform-Windows%2010%2F11-blue)](https://microsoft.com)

**English** | [简体中文](README_zh.md)

---

## What is lingual-desktop?

`lingual-desktop` is **NOT a replacement for your input method**. You continue using your favorite input method without changing a single typing habit.

It is an **ambient, system-wide companion layer** running as a lightweight Windows utility:
* **Translate Mode (`[EN]`)**: Simply press `Enter` in any text box. `lingual-desktop` automatically inspects your text—if it's natural language, it translates it via your active engine, replaces your input box draft, and submits, while expanding the dual-register card for 3 seconds.
* **Learn Mode (`[LEARN]`)**: Simply press `Enter`. 0ms non-blocking pass-through. Your original text sends instantly, while the dual-register card pops up in the background for micro-learning.
* **Off Mode (`[OFF]`)**: Fully transparent. Zero hooks active.
* **Zero Newline Conflict**: `Ctrl+Enter` and `Shift+Enter` are **never intercepted**, preserving normal chat multiline and search newlines across all applications.

---

## Interaction Model

```
[Normal Typing State]
You type Chinese as usual in X/Twitter, Slack, Discord, or Bing search:
                      
   Caret ➔ 这个方案有点过度设计了，不如用标准库|        [⇄ EN]  <-- Steady Draggable Capsule

────────────────────────────────────────────────────────────────────────────────────────────
[Submit State: Press Enter]

  In Translate Mode:
  1. Inspects input text (0ms bypass for pure code, CLI commands, and English);
  2. Runs translation inference (Local Pi Model / Free Web Translate / Cloud LLM);
  3. Replaces input box text in-place and submits;
  4. HUD card smoothly expands:
     · [Source]  这个方案有点过度设计了，不如用标准库
     ┌ [Casual]  This feels a bit over-engineered; we'd be much better off with the standard library.
     │           (Natural conversational flow for Slack and daily standups)
     ├ [Formal]  The proposed approach introduces unnecessary complexity. Standard library is preferred.
     │           (High-precision technical prose for RFCs, PR reviews, and documentation)
     └ [Vocab]   over-engineered · be better off with · stick with
     (Auto-closes in 3 seconds; press Esc within 3s to undo and restore original draft)
```

---

## Key Engineering Pillars

### 1. Steady Resident & Freely Draggable Floating Capsule
* **No Jumpy Vanishing**: Instead of flickering based on erratic Win32 caret telemetry, the capsule stays steadily docked at your preferred screen location.
* **Full Mouse Dragging & Position Memory**: Click and drag the capsule or HUD header anywhere on screen. It remembers your exact `(x, y)` coordinates across reboots.
* **Intuitive Gestures**: Left-click the capsule to cycle modes (`EN` ⇄ `LEARN` ⇄ `OFF`); right-click to open Settings.

### 2. Enter-Driven Workflow with Native Terminal Isolation
* Works exactly like `pi-lingual`: no complex shortcut gymnastics to memorize. Select your mode, type, and press **`Enter`**.
* **Terminal Process Guard**: Automatically recognizes terminal emulators (`WindowsTerminal`, `PowerShell`, `cmd`, `WezTerm`, `Mintty`). Terminals are 100% passed through with zero interception, preventing any interference with your CLI agent.

### 3. Three Transparent Engine Tiers (Including $0 Zero-Cost Options)
* **Tier 1: Reuse Local Pi Model ($0 Extra, Recommended)**: Automatically discovers and shares the model already configured in `~/.pi/agent/models.json` (e.g. `gemini-3.8-flash`). Zero extra cost, full dual-register capability.
* **Tier 2: Free Web Translate (Google / MyMemory, No Key Needed)**: Uses public web translation APIs with zero registration, zero accounts, and zero keys. Outputs 1 direct translation line.
* **Tier 3: Free-Tier or Custom LLM API Key**: Connect your own key, including permanently free LLM endpoints such as **Zhipu GLM-4-Flash (Free ¥0)**, **SiliconFlow Qwen2.5-7B (Free ¥0)**, **Groq Llama-3.3 (Free Tier)**, DeepSeek, or OpenAI.

### 4. Paper & Stone Minimalist Editorial Design System
* Styled with a warm paper canvas (`#fbfaf8`), clean white cards (`#ffffff`), and charcoal stone typography (`#1c1917`).
* **Zero Cheesy Emojis**: Clean monospace tags and crisp typography.
* **4-Language Switcher**: Switch the interface anytime between `EN`, `ZH`, `TW`, and `JA` with instant auto-save.

### 5. Natural Language Layout Tuner with Live WYSIWYG Preview
* Describe how you want your card formatted in natural language (e.g. *"Single line only for fast chat, no source row or vocab"* or *"Polite customer support reply and concise follow-up"*).
* The engine dynamically compiles custom `SlotConfig[]` arrays with instant visual feedback on the live card preview.

---

## Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Active Windows App                   │
│         (X / Browser, Slack, Discord, Notion, Word)    │
└──────────────────────────┬─────────────────────────────┘
                           │ 1. Text input & Enter submission
                           ▼
┌────────────────────────────────────────────────────────┐
│              lingual-desktop Host Layer                │
│    (Electron + Native MinGW C & C# UIA Bridge)         │
│  - UIA ValuePattern UTF-8 direct reading (< 2ms)       │
│  - Terminal process isolation (WindowsTerminal guard)  │
│  - Steady resident draggable capsule & position store  │
│  - Mode FSM & Enter dispatch router                    │
└──────────────────────────┬─────────────────────────────┘
                           │ 2. Dual-register translation
                           ▼
┌────────────────────────────────────────────────────────┐
│           Translation Engine & Resilience Matrix       │
│  - Tier 1: Local Pi Model auto-discovery ($0 extra)    │
│  - Tier 2: Free Web Translate (Google / MyMemory GTX)  │
│  - Tier 3: Free-Tier LLMs (GLM-4-Flash ¥0 / Qwen ¥0)   │
│  - Atomic Clipboard Transaction Sentinel (< 160ms)     │
└────────────────────────────────────────────────────────┘
```

---

## Build & Physical Verification

```bash
# Compile native MinGW C and C# UIA helpers
npm run build:native

# Compile Electron main process and preload bundle
npm run build:main

# Run full physical unit test suite (24/24 Pass)
npm test
```

---

## License

MIT © Jason & Lingual Contributors
