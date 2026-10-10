# lingual-desktop · 全平台通用随身外挂语言伴侣

> **不替代你的输入法 · 随身光标微胶囊 · 发送拦截与双模分流 · 剪贴板历史零污染**  
> 你完全照旧使用最顺手的**微软拼音、微信输入法、搜狗或 Rime**，在任何软件（X/推特、Slack、Discord、VS Code、Notion、微信、邮件）中打字。打完敲发送，`lingual-desktop` 自动按模式拦截与分流，直接发出地道英文或原文，并就地展开双轨伴学视窗。

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE) [![Tests: 12/12 Pass](https://img.shields.io/badge/Tests-12%2F12%20Pass-brightgreen)](tests/win32.test.ts) [![Platform: Windows](https://img.shields.io/badge/Platform-Windows%2010%2F11-blue)](https://microsoft.com)

[English](README.md) | **简体中文**

---

## 什么是 lingual-desktop？

`lingual-desktop` **绝不是一个输入法软件，也绝不替代你的现有输入法**。你不需要换掉用了多年的微软拼音，也不需要适应任何新的打字习惯。

它是一个**常驻在 Windows 系统托盘的随身外挂语言伴侣**。当你打字时，它只在光标右上方静默跟随一个半透明的微胶囊（`⇄ [EN]`）。当你打完一句话敲下发送（`Ctrl+Enter` 或配置好的发送键）时：
* **英文模式 (`[EN]`)**：自动截获你的中文草稿，通过 `@lingual/core` 极速转换为地道硅谷口语或规范技术英文，通过 Windows 原生 UIA 管道写回输入框并真正发出，同时胶囊就地平滑展开为 Left-Rail 树形 HUD，展示发出的内容与重点短语释义（3 秒后自动隐去）；
* **原文模式 (`[ZH]`)**：0ms 彻底非阻塞放行，你的中文原文秒级发出去，HUD 卡片在后台异步展开供你对照双轨英文与词汇微学习；
* **关闭模式 (`[OFF]`)**：微胶囊隐藏，完全透明静默。

---

## 交互心流 (Interaction Model)

```
[场景 1：日常正常敲字]
你在 X/推特、Slack 或微信里用微软拼音正常打字：
                      
   光标 ➔ 这个方案有点过度设计了，不如用标准库|  ⇄ [EN]  <-- 随身微胶囊 (不抢输入焦点)

────────────────────────────────────────────────────────────────────────────────────────────
[场景 2：按下发送键 (Ctrl+Enter 或 发送)]

  【英文模式】：
  1. 通过 Windows UI Automation 截获当前输入文本 (0ms，零剪贴板污染)；
  2. @lingual/core 极速生成 (直连 Groq / Gemini / 本地 Ollama)；
  3. 英文自动填入目标文本框并触发真正发送；
  4. 微胶囊平滑展开为经典的左轨树伴学 HUD：
     · [Original] 这个方案有点过度设计了，不如用标准库
     ┌ [Spoken]   This feels a bit over-engineered; we'd be much better off sticking with the standard library.
     │            (感觉过度设计了，用标准库划算得多)
     ├ [Written]  The proposed approach introduces unnecessary complexity. Standard library is preferred.
     │            (该方案引入了不必要的复杂度，建议优先采用原生实现)
     └ [Vocab]    over-engineered · be better off · stick with
     (显示 3 秒后或按下新按键时自动收起)
```

---

## 五大核心工程支柱

### 1. 零输入法替代成本 (与任意现有输入法和谐共生)
无需学习新输入法，无需折腾复杂的 TSF 驱动配置。`lingual-desktop` 运行在纯用户态，通过 Windows UI Automation 监听输入控件边界，完全不碰你的拼音选词管线。

### 2. 无焦点幽灵微胶囊 (`WS_EX_NOACTIVATE`)
跟随光标浮动的微胶囊具备 Windows 原生 `WS_EX_NOACTIVATE` 特性，绝对不会抢走正在打字的焦点，打字心流零打断。
* 敲击 **`Alt+Q`** 或鼠标点击胶囊，即可在 **`[EN]`** ⇄ **`[ZH]`** ⇄ **`[OFF]`** 三模之间快速轮转。

### 3. 可选的确认流 (自动瞬发 vs 预览确认)
* **默认自动发送 (`autoSend: true`)**：敲发送键后，自动换为英文发出，弹窗展示 3 秒供认知吸收，省心极速。
* **确认模式 (`autoSend: false`)**：敲发送键后暂停发出，弹窗展开 `[1] 口语` 与 `[2] 书面`，按 1 或 2 确认后再真正发出，彻底消除词义偏差顾虑。

### 4. 混合零污染注入 (UIA 优先 + 原子剪贴板兜底)
* **首选**：直接通过 Windows UIA `ValuePattern::SetValue` 改写目标文本框（0 剪贴板读写，速度极快）。
* **兜底**：遇到极少数不支持 UIA 的自绘编辑器时，自动走**原子剪贴板事务**（发送完成后 160ms 自动还原用户原本的剪贴板历史，Windows 11 的 `Win+V` 剪贴板完全不被污染）。

### 5. 0ms 代码与终端命令护盾 (Shield)
继承自 `@lingual/core`，40+ 常见命令行前缀（`git`, `npm`, `cargo`, `docker`, `curl` 等）和常见编程语言代码语句在 0.1ms 内自动直通，绝不浪费 1 个 Token。

---

## 系统架构拓扑

```
┌────────────────────────────────────────────────────────┐
│                   任意 Windows 应用程序                 │
│         (X / 网页浏览器、Slack、Discord、VS Code、微信) │
└──────────────────────────┬─────────────────────────────┘
                           │ 1. 敲击与光标位置感知
                           ▼
┌────────────────────────────────────────────────────────┐
│              lingual-desktop 原生宿主层                 │
│     (Electron + MinGW GCC 原生 C & C# UIA 桥接器)      │
│  - GetGUIThreadInfo:   实时捕获光标屏幕绝对坐标        │
│  - UIA ValuePattern:   零剪贴板直接读写活跃文本框      │
│  - WS_EX_NOACTIVATE:   随身微胶囊 (绝对不抢焦点)       │
│  - 发送拦截网关:       English 模式 / Original 模式分流 │
└──────────────────────────┬─────────────────────────────┘
                           │ 2. 文本载荷
                           ▼
┌────────────────────────────────────────────────────────┐
│           @lingual/core 核心双语域引擎                 │
│  - shield.ts:   0ms 识别代码/CLI 命令直接放行          │
│  - cache.ts:    50-entry LRU 缓存秒级命中              │
│  - prompts.ts:  硅谷口语/推特 Hook ⇄ RFC 技术书面对冲  │
└──────────────────────────┬─────────────────────────────┘
                           │ 3. 结构化结果
                           ▼
┌────────────────────────────────────────────────────────┐
│            平滑展开的 Left-Rail 树形伴学视窗           │
│  自动发送态: ✓ 已自动发出 (3秒后自动淡出)              │
│  预览确认态: [1] 选口语  │  [2] 选书面  │  [Esc] 取消   │
└────────────────────────────────────────────────────────┘
```

---

## 快速上手与验证

```bash
cd D:/Workspace/projects/lingual-desktop
npm install
npm run build   # 编译原生 C/UIA 助手与主进程
npm test        # 12/12 物理测试全绿通过
npm start       # 启动系统托盘后台伴侣进程
```

---

## 配置文件 (`~/.lingual/config.json`)

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

## 开源协议

MIT © [Jason Song](https://github.com/3ZEROS12)
