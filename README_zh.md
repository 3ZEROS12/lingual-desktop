# lingual-desktop · 全平台通用随身外挂语言伴侣

> **不替代你的输入法 · 回车即发即翻 · 常驻可自由拖拽微胶囊 · 剪贴板历史零污染**  
> 你完全照旧使用最顺手的**微软拼音、微信输入法、搜狗或 Rime**，在任何软件（X/推特、Slack、Discord、必应/谷歌搜索、Notion、微信、邮件）中打字。打完敲回车（Enter），`lingual-desktop` 自动判断自然语言并按模式分流，直接发出地道外语或原文，并就地展开双轨伴学视窗。

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE) [![Tests: 54/54 Pass](https://img.shields.io/badge/Tests-54%2F54%20Pass-brightgreen)](tests/engine.test.ts) [![Platform: Windows](https://img.shields.io/badge/Platform-Windows%2010%2F11-blue)](https://microsoft.com)

[English](README.md) | **简体中文** | [日本語](README_ja.md)

---

## 什么是 lingual-desktop？

`lingual-desktop` **绝不是一个输入法软件，也绝不替代你的现有输入法**。你不需要换掉用了多年的输入法，也不需要改变任何打字习惯。

它是常驻在 Windows 桌面端的随身伴侣层，逻辑与 `pi-lingual` 完全一致：
* **译文模式 (`[EN]`)**：在任何输入框打完字直接按 **`Enter`**。自动识别中文，通过所选模型转换并直接替换输入框发出，同时在屏幕展开伴学卡片供你核对（3 秒后自动隐去；3 秒内按 Esc 可瞬间撤回恢复原中文草稿）；
* **伴学模式 (`[LEARN]`)**：按 **`Enter`** 0ms 彻底非阻塞放行，你的中文原文秒级发出去，卡片在后台异步展开供你学习地道英文与词汇搭配；
* **关闭模式 (`[OFF]`)**：完全静默，不拦截任何回车；
* **换行零冲突**：仅监听单 Enter，**`Ctrl+Enter` 与 `Shift+Enter` 换行键 100% 原生保留**，绝不影响普通换行。

---

## 为什么是桌面层，而不是又一个终端插件

`pi-lingual` 优化的是你交给 AI 智能体的提示词，它只活在一个终端里。`lingual-desktop` 解决的是另一半问题：**你发给「人」的那句话，发生在任何一个 Windows 应用里。** 形态本身决定了 CLI 插件结构上做不到的事：

| 能力 | 终端插件 | lingual-desktop |
| --- | --- | --- |
| 能看到什么文本 | 只有智能体输入框 | 所有输入框（微信、Slack、Discord、Outlook、X、游戏） |
| 知道对话对象 | 单一上下文 | 应用 + 窗口标题 → 语气提示 |
| 看到「对方发来的消息」 | ✗ | ✓ 选中即捕获 → 回信助手 |
| 发送前介入 | ✗ | ✓ 原地改写，绝不覆盖草稿 |
| 无感常驻 | ✗ | ✓ 不抢焦点的悬浮岛 |

### 回信助手 (Reply Copilot · `Alt+R`)

终端里永远做不到的一条链路：**回对方刚发来的消息。**

1. 在任意应用里选中收到的消息（微信 / Slack / Outlook / Discord…）。
2. 按 `Alt+R`。
3. 悬浮岛展开：**对方到底想要什么**（用你的母语说清）+ 三条可直接发送的回复，按「沟通动作」而不是「语气」分类 —— 答应 / 婉拒 / 追问。
4. 按 `1`-`3` 插入，`0` 取消。

回复使用对方的语言；如果对方本来就写你的母语，则切换成你正在练的那门语言。全程不覆盖已有草稿：回复框里已经有字时，只复制不粘贴。

---

## 交互心流 (Interaction Model)

```
[场景 1：日常正常打字]
你在 X/推特、Slack、微信或搜索框里打中文：
                      
   光标 ➔ 这个方案有点过度设计了，不如用标准库|        [⇄ EN]  <-- 稳定常驻且可自由拖拽的胶囊

────────────────────────────────────────────────────────────────────────────────────────────
[场景 2：按下回车 (Enter)]

  【译文模式】：
  1. 自动判断输入内容（代码、终端命令、纯英文自动 0ms 放行）；
  2. 调用翻译引擎（本机 Pi 模型 / 免费网页翻译 / 云端大模型）；
  3. 原地替换输入框文本并真正发出；
  4. 伴学卡片就地展开：
     · [Source]  这个方案有点过度设计了，不如用标准库
     ┌ [Casual]  This feels a bit over-engineered; we'd be much better off with the standard library.
     │           (自然地道的美式口语，适合 Slack 沟通与日常站会)
     ├ [Formal]  The proposed approach introduces unnecessary complexity. Standard library is preferred.
     │           (严谨现代的技术书面语，适合 PR 审查、RFC 与文档)
     └ [Vocab]   over-engineered · be better off with · stick with
     (显示 3 秒后自动隐去；3 秒内按 Esc 可一键撤回恢复原草稿)
```

---

## 核心工程支柱

### 1. 稳定常驻 + 鼠标自由拖拽与位置记忆
* **告别乱闪乱跳**：不再依赖脆弱的 Windows 光标坐标轮询。胶囊稳定常驻在屏幕边缘，绝不在屏幕正中随机闪现。
* **任意位置拖拽**：按住鼠标左键即可将胶囊或 HUD 卡片拖到屏幕任意角落，松手自动持久化记忆坐标（`capsulePos: { x, y }`）。
* **极简交互手势**：左键单击胶囊切换模式（`EN` ⇄ `LEARN` ⇄ `OFF`）；右键单击呼出设置控制中心。

### 2. 回车自动驱动 + 终端进程绝对隔离
* 与 `pi-lingual` 一样直观：不用记复杂的快捷键组合，选好模式打完字直接敲 **`Enter`**。
* **终端免打扰**：底层自动识别终端进程（`WindowsTerminal`、`PowerShell`、`cmd`、`WezTerm`、`Mintty`）。在终端打字 100% 原样放行，绝不向终端误发全选复制，完全不干扰命令行开发。

### 3. 三大清晰驱动引擎（包含零成本方案）
* **方案 1：直接复用本机 Pi 模型（推荐 · 零额外花费）**：自动读取 `~/.pi/agent/models.json`（如 `gemini-3.8-flash`），无需重复填 Key，直接享受完整的大模型多语气对比与词汇生成。
* **方案 2：免注册基础网页翻译（Google / MyMemory · 无需任何 Key）**：直接调用免注册的公共网页翻译接口（适合全新电脑临时应急，每次输出 1 行标准译文）。
* **方案 3：永久免费大模型 API 或自定义密钥**：支持填入自己的 Key，并预设了 **智谱 GLM-4-Flash（官方永久免费 ¥0）**、**硅基流动 Qwen2.5-7B（官方永久免费 ¥0）**、**Groq（免费额度）**、DeepSeek 与 OpenAI。

### 4. Paper & Stone 极简编辑部设计风格
* 采用白画布/暖纸底色（`#fbfaf8`）、纯白卡片（`#ffffff`）与炭石黑字（`#1c1917`）。
* **零表情包**：彻底剥除花哨的表情符号与廉价赛博黑底色，回归专业冷峻的高信息密度排版。
* **四语种即时切换**：右上角提供极简双字母切换器（`EN` / `ZH` / `TW` / `JA`），点击即时全界面切换并自动落盘。

### 5. 一句话版式定制 + 所见即所得实时预览
* 输入任意大白话需求（如*“只要一行极简译文，不要原文和词汇”* 或 *“商务客服：客气回复加简短催单”*），引擎动态解析生成专属槽位结构。
* 勾选任意行项，上方预览卡片当场同步更新。

---

## 系统架构拓扑

```
┌────────────────────────────────────────────────────────┐
│                   任意 Windows 应用程序                 │
│         (X / 浏览器、Slack、Discord、Notion、微信)      │
└──────────────────────────┬─────────────────────────────┘
                           │ 1. 敲击与回车自动分流
                           ▼
┌────────────────────────────────────────────────────────┐
│              lingual-desktop 原生宿主层                 │
│     (Electron + MinGW GCC 原生 C & C# UIA 桥接器)      │
│  - UIA ValuePattern UTF-8 直接读取 (< 2ms)             │
│  - 终端环境进程识别 (WindowsTerminal 隔离保护)         │
│  - 常驻悬浮胶囊自由拖拽与坐标记忆                      │
│  - 模式状态机与 Enter 自动派发分流网关                 │
└──────────────────────────┬─────────────────────────────┘
                           │ 2. 双语境推理驱动
                           ▼
┌────────────────────────────────────────────────────────┐
│           翻译推理引擎与容错降级流水线                 │
│  - Tier 1: 本机 Pi 模型自动发现与共享 ($0 成本)        │
│  - Tier 2: 免 Key 公共网页翻译接口 (Google / MyMemory) │
│  - Tier 3: 官方永久免费大模型 API (GLM-4-Flash ¥0 等)  │
│  - 原子剪贴板事务哨兵恢复机制 (< 160ms)                │
└────────────────────────────────────────────────────────┘
```

---

## 物理构建与测试

```bash
# 编译 MinGW C 与 C# UIA 原生二进制辅助器
npm run build:native

# 编译 Electron 主进程与 Preload 脚本
npm run build:main

# 运行全量单元测试套件 (54/54 Pass)
npm test
```

---

## 生态协同：Pi 终端与桌面套件

每个工具均占用互斥的终端或桌面插槽，协同运行零干扰：

| 工具包 | 运行环境与插槽 | 机制与职责 | 安装 / 链接 |
| :--- | :--- | :--- | :--- |
| **[`lingual-desktop`](https://github.com/3ZEROS12/lingual-desktop)** *(当前)* | Windows 桌面极简灵动岛 | 底层低级键盘钩子（`WH_KEYBOARD_LL`），顶部原位 3 秒卡片与全局输入桥接 | [GitHub Release](https://github.com/3ZEROS12/lingual-desktop/releases) |
| **[`pi-lingual`](https://github.com/3ZEROS12/pi-lingual)** | 终端 `aboveEditor` 视窗 | 双语双寄存器伴学卡片（≤9 行，UAX #11 树状）与 0-token 提示词规范化 | `pi install npm:pi-lingual` |
| **[`toolflow`](https://github.com/3ZEROS12/toolflow)** | 终端工具沙箱 | 阶段门控工具挂载与 >40 行冗长日志落盘脱水（-95% 上下文消耗） | `pi install npm:toolflow` |
| **[`pi-tui-status-beautifier`](https://github.com/3ZEROS12/pi-tui-status-beautifier)** | 终端底部状态栏 | 6 套预设徽章，`<80` 列静默折叠（`+N idle`），0 渲染循环读盘开销 | `pi install npm:pi-tui-status-beautifier` |
| **[`pi-anchor`](https://github.com/3ZEROS12/anchor)** | 终端 `belowEditor` 便签条 | 1 行常驻便签，0ms `pin:` 拦截，`[■■□□]` 进度条与 `↪` 会话跳转 | `pi install npm:pi-anchor` |

---

## 授权许可

MIT © Jason & Lingual Contributors
